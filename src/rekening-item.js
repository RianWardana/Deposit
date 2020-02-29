import {PolymerElement, html} from '@polymer/polymer';

class rekeningItem extends PolymerElement {
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment shared-styles">  
        </style>

        <paper-material>
            <template is="dom-if" if="{{apakahKredit(jenis)}}"><div class="banner kredit"></div></template>
            <template is="dom-if" if="{{!apakahKredit(jenis)}}"><div class="banner debit"></div></template>
            <paper-ripple recenters=""></paper-ripple>
            <div class="content">
                <div class="horizontal layout">
                    <span>{{nama}}</span> 
                    <span class="flex"></span>
                    <span>{{formatJumlah(jenis, jumlah)}}</span>
                </div>
                <div class="horizontal layout">
                    <span>{{waktu}}</span> 
                    <span class="flex"></span>
                </div>
            </div>
        </paper-material>
`;
  }

  static get is() {
      return 'rekening-item';
  }

  static get properties() {
      return {
          waktu: String,
          nama: String,
          jenis: String,
          jumlah: Number
      };
  }

  formatJumlah(dataJenis, dataJumlah) {
      var dataJumlahInt = parseInt(dataJumlah);
      return (dataJenis == 'kredit' ? '+ Rp' : '- Rp') + dataJumlahInt.toLocaleString('id-ID');
  }

  apakahKredit(jenis) {
      return (jenis == 'kredit' ? true : false);
  }
}

customElements.define(rekeningItem.is, rekeningItem);
