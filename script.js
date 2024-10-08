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

    // Per ogni simulazione t
    for (let t = 0; t < T; t++) {
        // Per ogni server j
        for (let j = 0; j < N; j++) {
            // Per ciascun hacker i
            for (let i = 0; i < M; i++) {
                // Controlla se il server j è già stato bucato da i
                if (!serverBucati[i].has(j)) { 
                    let r = Math.random(); // Genera un numero casuale tra 0 e 1

                    // Se r <= p, l'hacker riesce a bucare il server
                    if (r <= p) {
                        serverBucati[i].add(j); // Aggiungi il server bucato al set
                    }
                }
            }
        }

        // Dopo tutti i tentativi per t, calcola i successi
        for (let i = 0; i < M; i++) {
            successiPerHacker[i][t] = serverBucati[i].size; // Aggiorna i successi per l'hacker
        }
    }

    // Calcolo del totale dei server bucati per ciascun hacker alla fine di tutti i tentativi
    let totaleSuccessiPerHacker = successiPerHacker.map(successi => successi[T - 1]);

    // Applichiamo la somma compensata di Knuth per calcolare la somma complessiva
    let sommaTotale = 0;
    let compensazioneTotale = 0;
    
    for (let successi of totaleSuccessiPerHacker) {
        let risultato = sommaCompensata(sommaTotale, successi, compensazioneTotale);
        sommaTotale = risultato.somma;
        compensazioneTotale = risultato.compensazione;
    }

    let totaleSuccessi = sommaTotale; // Totale dei server bucati complessivamente

    // Calcolo della distribuzione empirica per ciascun hacker con somma compensata
    let distribuzioneEmpirica = [];
    let sommaDistribuzione = 0;
    let compensazioneDistribuzione = 0;

    for (let successi of totaleSuccessiPerHacker) {
        let percentuale = successi / totaleSuccessi; // Percentuale di attacchi riusciti per ogni hacker
        distribuzioneEmpirica.push(percentuale);

        // Usare la somma compensata per calcolare la somma delle distribuzioni
        let risultato = sommaCompensata(sommaDistribuzione, percentuale, compensazioneDistribuzione);
        sommaDistribuzione = risultato.somma;
        compensazioneDistribuzione = risultato.compensazione;
    }

    // Restituiamo anche successiPerHacker per disegnare il grafico correttamente
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
function disegnaGrafico(successiPerHacker, distribuzioneEmpirica, totaleSuccessi, T, N) {
    let hackersData = [];
    for (let i = 0; i < successiPerHacker.length; i++) {
        hackersData.push({
            label: `Hacker ${i + 1}: - server broken: ${successiPerHacker[i][T - 1]} / ${totaleSuccessi}, - Empirical Distribution: ${distribuzioneEmpirica[i].toFixed(2)}`,
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
    const { successiPerHacker, totaleSuccessi, distribuzioneEmpirica } = simulazioneHackingServer(N, M, p, T);
    
    document.getElementById('mod').style.display = 'none'; // Nascondi la modale
    // Disegna il grafico con i risultati
    disegnaGrafico(successiPerHacker, distribuzioneEmpirica, totaleSuccessi, T, N);
});
