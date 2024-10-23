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
            if (r <= (p/N)) {
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


// Funzione per calcolare la varianza dei successi totali
function calcolaVarianza(totaleSuccessiPerHacker, media) {
    let sommaQuadrati = totaleSuccessiPerHacker.reduce((acc, val) => acc + Math.pow(val - media, 2), 0);
    return sommaQuadrati / totaleSuccessiPerHacker.length;
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
let histogramChart;

// Funzione per disegnare il grafico principale
function disegnaGrafico(successiPerHacker, distribuzioneEmpirica, N, M) {
    const ctx = document.getElementById('attacchiGrafico').getContext('2d');

    // Verifica se myChart esiste e distruggilo prima di crearne uno nuovo
    if (myChart) {
        myChart.destroy();
    }

    // Calcola la somma totale dei successi
    let totaleSuccessi = 0;
    for (let i = 0; i < M; i++) {
        totaleSuccessi += successiPerHacker[i][N - 1];
    }

    // Creare i dataset per ogni hacker
    let hackersData = [];
    for (let i = 0; i < M; i++) {
        const successiHacker = successiPerHacker[i][N - 1];
        let frazioneHackerati = "";

        if (successiHacker > 0) {
            frazioneHackerati = `${successiHacker} / ${totaleSuccessi}`;
        } else {
            frazioneHackerati = '0';
        }

        hackersData.push({
            label: `Hacker ${i + 1}: Hacked Server: ${frazioneHackerati} - Distribution: ${distribuzioneEmpirica[i].toFixed(2)}`,
            data: successiPerHacker[i], // Assegnazione: y = successi, x = server (0, 1, ..., N-1)
            borderColor: getRandomColor(),
            fill: false,
            stepped: true // Linea a gradini
        });
    }

    // Costruire il grafico principale
    myChart = new Chart(ctx, {
        type: 'line', // Grafico a linee
        data: {
            labels: Array.from({ length: N }, (_, index) => `Server ${index + 1}`), // Server come etichette
            datasets: hackersData
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                        text: 'Number of Success'
                    },
                    beginAtZero: true,
                    max: N
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

    // Disegna l'istogramma della distribuzione dopo aver creato il grafico principale
    disegnaIstogramma(successiPerHacker, M);
}




function disegnaIstogramma(successiPerHacker) {
    const ctx = document.getElementById('istogrammaGrafico').getContext('2d');

    // Verifica se histogramChart esiste e distruggilo prima di crearne uno nuovo
    if (histogramChart) {
        histogramChart.destroy();
    }

    // Estrai i successi totali per ciascun hacker
    const successiTotali = successiPerHacker.map(successi => successi[successi.length - 1]);

    // Calcola la distribuzione dei successi
    const distribuzioneSuccessi = {};
    successiTotali.forEach(successo => {
        if (distribuzioneSuccessi[successo]) {
            distribuzioneSuccessi[successo]++;
        } else {
            distribuzioneSuccessi[successo] = 1;
        }
    });

    // Crea le etichette e i dati per il grafico
    const labels = Object.keys(distribuzioneSuccessi).sort((a, b) => a - b);
    const data = labels.map(label => distribuzioneSuccessi[label]);

    // Costruire il grafico istogramma ruotato di 90 gradi
    histogramChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Success Distribution',
                data: data,
                backgroundColor: data.map(() => getRandomColor())
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',  // Ruota l'istogramma di 90 gradi
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Number of Hackers'  // Ora diventa l'asse X
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1 
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Success'  // Ora diventa l'asse Y
                    },
                    beginAtZero: true,
                    reverse: true,
                    ticks: {
                        stepSize: 1 
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}


function calcolaMediaTotaleSuccessi(totaleSuccessiPerHacker) {
    let sommaTotale = totaleSuccessiPerHacker.reduce((acc, val) => acc + val, 0); // Somma totale di successi per tutti gli hacker
    return sommaTotale / totaleSuccessiPerHacker.length; // Media dei successi totali
}


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

    // Calcola i successi totali per ciascun hacker
    const totaleSuccessiPerHacker = successiPerHacker.map(successi => successi[N - 1]);

    // Calcola la media dei successi totali
    const mediaSuccessiTotali = calcolaMediaTotaleSuccessi(totaleSuccessiPerHacker);

    // Calcola la varianza dei successi totali
    const varianzaSuccessiTotali = calcolaVarianza(totaleSuccessiPerHacker, mediaSuccessiTotali);

    const standardDeviation = Math.sqrt(varianzaSuccessiTotali);

    // Inietta il risultato nel HTML
    document.querySelector('.homework-content').innerHTML += `
        <p><br></p>
        <p>Mean of Total Successes Across All Hackers: ${mediaSuccessiTotali.toFixed(2)}</p>
        <p>Variance of Total Successes Across All Hackers: ${varianzaSuccessiTotali.toFixed(2)}</p>
        <p>Standard Deviation: ${standardDeviation.toFixed(2)}</p>`;
});

