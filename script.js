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
    let posizioniY = Array(M).fill(0); // Posizioni attuali sull'asse Y per ogni hacker

    // Ciclo esterno sui server
    for (let j = 0; j < N; j++) {
        // Ogni hacker prova ad attaccare il server j
        for (let i = 0; i < M; i++) {
            let r = Math.random(); // Genera un numero casuale tra 0 e 1
            
            // Se r <= p, l'hacker riesce a bucare il server
            if (r <= p) {
                posizioniY[i]++; // Incrementa la posizione dell'hacker sull'asse Y
            }
        }

        // Aggiorna i successi per ogni hacker
        for (let i = 0; i < M; i++) {
            successiPerHacker[i][j] = posizioniY[i]; // Assegna la posizione attuale come successo
        }
    }

    // Calcolo del totale dei successi per ciascun hacker alla fine della simulazione
    let totaleSuccessiPerHacker = successiPerHacker.map(successi => successi[N - 1]);

    // Applicazione della somma compensata di Knuth per calcolare la somma complessiva
    let sommaTotale = 0;
    let compensazioneTotale = 0;
    
    for (let successi of totaleSuccessiPerHacker) {
        let risultato = sommaCompensata(sommaTotale, successi, compensazioneTotale);
        sommaTotale = risultato.somma;
        compensazioneTotale = risultato.compensazione;
    }

    // Calcolo della distribuzione empirica
    let distribuzioneEmpirica = [];
    let sommaDistribuzione = 0;
    let compensazioneDistribuzione = 0;

    for (let successi of totaleSuccessiPerHacker) {
        let percentuale = successi / sommaTotale; // Percentuale di attacchi riusciti per ogni hacker
        distribuzioneEmpirica.push(percentuale);

        // Usare la somma compensata per calcolare la somma delle distribuzioni
        let risultato = sommaCompensata(sommaDistribuzione, percentuale, compensazioneDistribuzione);
        sommaDistribuzione = risultato.somma;
        compensazioneDistribuzione = risultato.compensazione;
    }

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
// Funzione per disegnare il grafico
function disegnaGrafico(successiPerHacker, distribuzioneEmpirica, N, M) {
    const ctx = document.getElementById('attacchiGrafico').getContext('2d');
    
    // Check if myChart already exists and destroy it
    if (myChart) {
        myChart.destroy();
    }

    // Calcolo della somma totale dei successi
    let totaleSuccessi = 0; // Inizializzazione
    for (let i = 0; i < M; i++) {
        totaleSuccessi += successiPerHacker[i][N - 1]; // Somma successi per ogni hacker
    }

    // Creare i dataset per ogni hacker
    let hackersData = [];
    for (let i = 0; i < M; i++) {
        // Calcolare il numero di successi per l'hacker corrente
        const successiHacker = successiPerHacker[i][N - 1]; // Successi dell'ultimo server
        let frazioneHackerati = ""; // Inizializzazione variabile per la frazione

        // Mostra la frazione solo se successiHacker > 0
        if (successiHacker > 0) {
            frazioneHackerati = `${successiHacker} / ${totaleSuccessi}`; // Costruzione della frazione
        } else {
            frazioneHackerati = "0"; // Messaggio se non ci sono successi
        }

        hackersData.push({
            label: `Hacker ${i + 1}: Successi Totali: ${successiHacker} - Server Hackerati: ${frazioneHackerati} - Distribuzione: ${distribuzioneEmpirica[i].toFixed(2)}`,
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

    // Esegui la simulazione e ottieni i risultati
    const { successiPerHacker, distribuzioneEmpirica } = simulazioneHackingServer(N, M, p);
    
    document.getElementById('mod').style.display = 'none'; // Nascondi la modale
    // Disegna il grafico con i risultati
    disegnaGrafico(successiPerHacker, distribuzioneEmpirica, N, M);
});
