// Funzione per la somma compensata di Knuth
function sommaCompensata(somma, valore, compensazione) {
    let y = valore - compensazione; 
    let t = somma + y; 
    compensazione = (t - somma) - y; 
    somma = t;  
    return { somma, compensazione };
}

// Funzione per simulare gli attacchi sui server
function simulazioneHackingServer(N, M, p, T) {
    let successiPerHacker = Array.from({ length: M }, () => Array(T).fill(0)); 
    let serverBucati = Array.from({ length: M }, () => new Set()); 

    for (let t = 0; t < T; t++) {
        for (let j = 0; j < N; j++) {
            for (let i = 0; i < M; i++) {
                if (!serverBucati[i].has(j)) { 
                    let r = Math.random(); 
                    if (r <= p) {
                        serverBucati[i].add(j); 
                    }
                }
            }
        }

        for (let i = 0; i < M; i++) {
            successiPerHacker[i][t] = serverBucati[i].size; 
        }
    }

    let totaleSuccessiPerHacker = successiPerHacker.map(successi => successi[T - 1]);

    // Utilizzo della somma compensata per calcolare il totale dei successi
    let somma = 0;
    let compensazione = 0;
    for (let successi of totaleSuccessiPerHacker) {
        let risultato = sommaCompensata(somma, successi, compensazione);
        somma = risultato.somma;
        compensazione = risultato.compensazione;
    }
    let totaleSuccessi = somma;

    let distribuzioneEmpirica = totaleSuccessiPerHacker.map(successi => {
        return (successi / totaleSuccessi * 100).toFixed(2); // Percentuale di attacchi riusciti per ogni hacker
    });

    return { successiPerHacker, distribuzioneEmpirica };
}


// Funzione per generare colori casuali per ogni linea (hacker)
function getRandomColor() {
    const letters = '0123456789ABCDEF'; 
    let color = '#'; 
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color; 
}

let myChart;
// Funzione per disegnare il grafico
function disegnaGrafico(successiPerHacker, distribuzioneEmpirica, T, N) {
    let hackersData = [];
    for (let i = 0; i < successiPerHacker.length; i++) {
        hackersData.push({
            label: `Hacker ${i + 1}: - server broken: ${successiPerHacker[i][T - 1]}, - Empirical Distribution: ${distribuzioneEmpirica[i].toFixed(2)}`,
            data: successiPerHacker[i],
            borderColor: getRandomColor(),
            fill: false
        });
    }

    const ctx = document.getElementById('attacchiGrafico').getContext('2d');
    // Check if myChart already exists and destroy it
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: T }, (_, i) => `t${i}`),
            datasets: hackersData
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Attempts (t)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Total Number of Broken Servers'
                    },
                    beginAtZero: true,
                    max: N // Imposta il valore massimo dell'asse y
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}


// Aggiungi evento al pulsante
document.getElementById('simulateButton').addEventListener('click', () => {
    // Leggi i valori dal modulo
    const N = parseInt(document.getElementById('n').value); // Numero di server
    const M = parseInt(document.getElementById('m').value); // Numero di hacker
    const p = parseFloat(document.getElementById('p').value); // Probabilità di successo
    const T = parseInt(document.getElementById('t').value); // Numero di simulazioni

    // Esegui la simulazione e ottieni i risultati
    const { successiPerHacker, distribuzioneEmpirica } = simulazioneHackingServer(N, M, p, T);
    
    document.getElementById('mod').style.display = 'none'; // Nascondi la modale
    // Disegna il grafico con i risultati
    disegnaGrafico(successiPerHacker, distribuzioneEmpirica, T, N);
});
