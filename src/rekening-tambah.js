import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

class rekeningTambah extends LitElement {
    
    static get properties() {
        return {
            daftarNamaRekening: Array,
            salinanPengeluaran: Object
        };
    }

    static get styles() {
        return [styles, css`
            #toggleContainer {
                display: flex;
                justify-content: space-evenly;
            }
            
            paper-fab {
                background-color: var(--app-primary-color);
                position: fixed;
                right: 5%;
                bottom: 5%;
            }

            @media (max-height: 450px) {
                paper-dialog {
                    bottom: 0;
                }
            }

            paper-toggle-button {
                --paper-toggle-button-unchecked-bar-color:  var(--paper-orange-500);
                --paper-toggle-button-unchecked-button-color:  var(--paper-orange-500);
                --paper-toggle-button-unchecked-ink-color: var(--paper-orange-500);
                --paper-toggle-button-checked-bar-color:  var(--paper-green-500);
                --paper-toggle-button-checked-button-color:  var(--paper-green-500);
                --paper-toggle-button-checked-ink-color: var(--paper-green-500);
            }
        `];
    }
    
    render() {
        customElements.whenDefined('vaadin-combo-box').then(() => {
            this.shadowRoot.getElementById('comboBox').items = this.daftarNamaRekening;
        });

        return html`
            <paper-dialog id="dialog" @iron-overlay-closed="${this._dialogClosed}">
                <h2>Mutasi Rekening</h2>
                <div class="flexSpaceBetween">
                    <vaadin-combo-box id="comboBox" placeholder="Nama" @input="${this.onChangeInput}" allow-custom-value></vaadin-combo-box>
                    <vaadin-integer-field id="inputJumlah" min="1" @input="${this.onChangeInput}">
                        <div slot="prefix">Rp</div>
                    </vaadin-integer-field>
                </div>
                <div id="toggleContainer">
                    <span>Debit</span>
                    <paper-toggle-button id="toggleJenis" noink></paper-toggle-button>
                    <span>Kredit</span>
                </div>
                <div class="buttons">
                    <paper-button dialog-confirm>Batal</paper-button>
                    <paper-button disabled id="btnTambah" @click="${this.tambah}">Tambah</paper-button>
                </div>
            </paper-dialog>

            <paper-fab id="fab" icon="add" @click="${this.onFabClick}"></paper-fab>
            <paper-toast id="toastKosong" text="Nama dan jumlah wajib diisi"></paper-toast>
        `;
    }

    constructor() {  
        super();
        this.daftarNamaRekening = [
            "Dana",
            "e-Money",
            "e-Toll",
            "Go-Pay",
            "OVO",
            "Gaji",
            "Transferan",
            "Tarik tunai",
            "Alfamidi",
            "Tokopedia"
        ];

        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) this.uid = firebaseUser.uid
        });
    }

    updated(changedProps) {
        if (changedProps.has('salinanPengeluaran'))
            this.kirimData(this.salinanPengeluaran);
    }

    tambah() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;
        let toggleJenis = this.shadowRoot.getElementById('toggleJenis').checked;
        
        if ((inputNama != "") && (inputJumlah != "")) { 
            this.shadowRoot.getElementById('dialog').close();
            this.kirimData({
                nama: inputNama,
                debit: (toggleJenis ? 0 : inputJumlah),
                kredit: (toggleJenis ? inputJumlah : 0)
            });
        } else {
            this.shadowRoot.getElementById('toastKosong').open();
        }
    }

    kirimData(data) {    
        let epoch = Math.floor(new Date() / -1000);
        let debit = parseInt(data.debit);
        let kredit = parseInt(data.kredit);

        // anti-pattern, cari cara lain, jangan pakai Rekening
        let saldo = Rekening.saldo + (kredit - debit);

        let dbRekening = firebase.database().ref(this.uid + "/rekening");
        dbRekening.child(epoch).set({
            nama: data.nama,
            debit: debit,
            kredit: kredit,
            saldo: saldo,
        }).then(e => 
            console.log("Penambahan mutasi rekening berhasil.")
        ).catch(e => 
            console.log(e.message));
    }

    _dialogClosed() {
        this.shadowRoot.getElementById('fab').style.display = 'block';
    }

    onFabClick() {
        this.shadowRoot.getElementById('comboBox').value = '';
        this.shadowRoot.getElementById('inputJumlah').value = '';
        this.shadowRoot.getElementById('toggleJenis').checked = false;
        this.shadowRoot.getElementById('btnTambah').setAttribute('disabled', true);
        this.shadowRoot.getElementById('dialog').open();
        this.shadowRoot.getElementById('fab').style.display = 'none'
    }

    onChangeInput() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;

        if ((inputNama != "") && (inputJumlah != ""))
            this.shadowRoot.getElementById('btnTambah').removeAttribute('disabled');
        else 
            this.shadowRoot.getElementById('btnTambah').setAttribute('disabled', true);
    }
}

customElements.define('rekening-tambah', rekeningTambah);