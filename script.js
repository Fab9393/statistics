// Funzione per la somma compensata di Knuth
function sommaCompensata(somma, valore, compensazione) {
    let y = valore - compensazione; 
    let t = somma + y; 
    compensazione = (t - somma) - y; 
    somma = t;  
    return { somma, compensazione };
}

// Funzione per simulare gli attacchi sugli n server da parte di m hacker con probabilità p
function simulazioneHackingServer(N, M, p) {
    let successiPerHacker = Array.from({ length: M }, () => Array(N).fill(0)); // Successi per ogni hacker su ogni server

    // Ciclo esterno sui server
    for (let j = 0; j < N; j++) {
        // Ogni hacker prova ad attaccare il server j
        for (let i = 0; i < M; i++) {
            let r = Math.random(); // Genera un numero casuale tra 0 e 1
            
            // Se r <= p, l'hacker riesce a bucare il server
            if (r <= p) {
                successiPerHacker[i][j]++; // Incrementa il numero di successi dell'hacker i sul server j
            }
        }
    }

    // Somma totale dei successi per tutti gli hacker
    let totaleSuccessi = successiPerHacker.map(successi => successi.reduce((acc, val) => acc + val, 0)); // Totale successi per ogni hacker

    // Calcolo della distribuzione empirica per ciascun hacker
    let distribuzioneEmpirica = [];
    let sommaDistribuzione = 0;
    let compensazioneDistribuzione = 0;

    for (let successi of totaleSuccessi) {
        let percentuale = successi / (N * M); // Percentuale di attacchi riusciti per ogni hacker
        distribuzioneEmpirica.push(percentuale);

        let risultato = sommaCompensata(sommaDistribuzione, percentuale, compensazioneDistribuzione);
        sommaDistribuzione = risultato.somma;
        compensazioneDistribuzione = risultato.compensazione;
    }

    return { successiPerHacker, totaleSuccessi, distribuzioneEmpirica };
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
function disegnaGrafico(successiPerHacker, distribuzioneEmpirica, totaleSuccessi, N, M) {
    const ctx = document.getElementById('attacchiGrafico').getContext('2d');
    // Check if myChart already exists and destroy it
    if (myChart) {
        myChart.destroy();
    }

    // Creare i dataset per ogni hacker
    let hackersData = [];
    for (let i = 0; i < M; i++) {
        hackersData.push({
            label: `Hacker ${i + 1} - Successi Totali: ${totaleSuccessi[i]}`,
            data: successiPerHacker[i], // Assegnazione: y = successi, x = server (0, 1, ..., N-1)
            borderColor: getRandomColor(),
            fill: false
        });
    }

    // Costruire il grafico
    myChart = new Chart(ctx, {
        type: 'line', // Grafico a linee
        data: {
            labels: Array.from({ length: N }, (_, index) => `Server ${index + 1}`), // Server come etichette
            datasets: hackersData
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Server'
                    },
                    ticks: {
                        beginAtZero: true
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Numero di Successi'
                    },
                    beginAtZero: true,
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

    // Esegui la simulazione e ottieni i risultati
    const { successiPerHacker, totaleSuccessi, distribuzioneEmpirica } = simulazioneHackingServer(N, M, p);
    
    document.getElementById('mod').style.display = 'none'; // Nascondi la modale
    // Disegna il grafico con i risultati
    disegnaGrafico(successiPerHacker, distribuzioneEmpirica, totaleSuccessi, N, M);
});
