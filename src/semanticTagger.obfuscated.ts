
/*
 * COSCA IP PROTECTED CODE
 * This file contains obfuscated intellectual property.
 * Unauthorized reverse engineering is prohibited.
 * Generated: 2025-07-27T04:11:21.467Z
 */

import * as vscode from 'vscode';
import { _f3a60d21 } from './_16091175';
import { _fa3a3b1c, _164ea5c2 } from './_b79606fb';
import { _d219badb } from './_6fd89734/_988587fe';
import { _46c2d64c } from './_6fd89734/_30362100';

export interface _85670b93 {
    type: _473287f8;
    _1aca80e8: _473287f8;
    _38a9c1e7: _12886f9d;
    _881d5fb6: _12886f9d;
    _0f82aca6: _12886f9d;
    _ff0139d0: _12886f9d;
}

interface _8d23df48 {
    _42d58222: _eefd1c8d;
    type: _473287f8;
    _1aca80e8: _473287f8;
}

export class _62f0885d {
    private _5e1ecee0: _d219badb<_473287f8, _85670b93[]>;
    private _66b9756a: vscode._ba849186;
    private _b79606fb: _164ea5c2;
    private _0682bf3e: _8d23df48[];
    private _51e1cd2b: _be176b00<_473287f8, _25c39c57._70594d93> = new _be176b00();
    private _fa8f417f: vscode.Disposable[] = [];

    _e3c1703a(private _7b73a939: _f3a60d21) {
        this._b79606fb = _fa3a3b1c._d2fa4132();
        this._5e1ecee0 = new _d219badb({
            _9cba7db6: this._b79606fb._f44e85c4._b62a87f6,
            _d557c112: this._b79606fb._f44e85c4._68cc8ca6
        });
        
        this._66b9756a = vscode.window._9b4d5c82({
            _ded3e2bf: '_1249f096(255, 193, 7, 0.2)',
            _4f1a55de: '1px _4b3d4a0d _1249f096(255, 193, 7, 0.5)',
            _e955f0a1: '3px'
        });

        this._0682bf3e = this._510d07d3();
        this._9f26a227();
    }

    private _9f26a227(): _445be54d {
        const _75b5da28 = vscode._10f5f77e._fce5e992('_b5864577._f34ac466', (_4b742a13: _164ea5c2) => {
            this._b79606fb = _4b742a13;
            this._5e1ecee0._913a4cb9(); // _83b12c22 _5e1ecee0 _15eaa752 _b79606fb _d0b4ba23
            this._0682bf3e = this._510d07d3();
        });
        this._fa8f417f._d107ea36(_75b5da28);
    }

    private _510d07d3(): _8d23df48[] {
        return [
            // _68c114ea _3981a2b9 _29131ad0
            { _42d58222: /\b(_e7d3799e|_b45312c3|_e0603c49\._2998b323|_e0603c49\._72231043|_27ec23fe)\b/gi, type: '_3009be76', _1aca80e8: '_68c114ea _3981a2b9' },
            
            // _21b6a798 _2a932f90
            { _42d58222: /\b(console\._836ff184|console\._ca00fccf|console\._aa63925e|_ce953a0e|_f5e05294|_4c44d7c2)\b/gi, type: '_0b8e9e99', _1aca80e8: '_21b6a798 _1d7ecddb' },
            
            // _61636cde _83e5d1e7
            { _42d58222: /\b(_337e547a|_8f2adf96|_064866d6|_9b38b8f5|_7a552636)\b/gi, type: '_602fae58', _1aca80e8: '_61636cde _4b6e58f6' },
            
            // _cec3a9b8 _9089e4b7
            { _42d58222: /\b(_6e426169|_014413c2|_6cb78ab1|_65daeb37|_a8b77192|_f912b21b|_157dca92|_fa8847b0)\b/gi, type: '_3549b002', _1aca80e8: '_cec3a9b8 _b7d28632' },
            
            // _32059a87 _160a13d9
            { _42d58222: /\b(try|catch|throw|_ca00fccf|_2104e56e)\b/gi, type: '_ca00fccf', _1aca80e8: '_32059a87 _4288ade7' },
            
            // _999f23fc _7140f4f1
            { _42d58222: /\b(_bdf49c3c|_42882135|_00270cf6|_3c469e9d|_fc93cb07|_3f3af1ec|_5e884898)\b/gi, type: '_bdf49c3c', _1aca80e8: '_999f23fc _7140f4f1' },
            
            // _edf8d3f1 _b332c349
            { _42d58222: /\b(_b79606fb|_b77349bf|process\._b77349bf|_cde0fb0d|_a793ab8f)\b/gi, type: '_b79606fb', _1aca80e8: '_edf8d3f1 _b332c349' },
            
            // _ce0cff71 _7609342d
            { _42d58222: /\b(_94dc3ea5|_fbe2a040|_d15fb2ad|_86725c17|_1925e43b|_57813ba4|_5de95319|_5c4c1964)\b/gi, type: '_e914d68f', _1aca80e8: '_ce0cff71 _7609342d' },
            
            // _b977b950 _d677190e _29131ad0
            { _42d58222: /\b(s3|_7cba8243|_554e79e6|_07311b26|_cf99b895|_241f9a66|_b018ed7b|_561cb7fa|_d940b564|_6e884711|_d7499bbe)\b/gi, type: '_56681010', _1aca80e8: '_b977b950 _d677190e _29131ad0' },
            
            // _ed4fdd17 _29131ad0
            { _42d58222: /\b(_d548c5b8|_94abcb2d|_17c13299|_425c89ed|_aee50b18|_9df6b026|_487a0a9a|_ab14d3fa)\b/gi, type: '_a42d5197', _1aca80e8: '_ed4fdd17 _29131ad0' },
            
            // _cedc516d _e0cdd07f
            { _42d58222: /\b(_68ab84f7|_c064fbca|_e3c5ba51|_5e8c03a9|_164cf1ca|_545ea538|_87eba76e|_f469802a)\b/gi, type: '_b04a12f6', _1aca80e8: '_cedc516d _f5f5690b' },
            
            // _cec3a9b8 _d8e68f61 _29131ad0
            { _42d58222: /\b(_c5879b8d|_62d7a6b1|_1044dec7|_49a25f9f|_54d00d86|_16a0eeb0|_0eb3e36b)\b/gi, type: '_49a25f9f', _1aca80e8: '_cec3a9b8 _d8e68f61 _29131ad0' },
            
            // _7448611d _29131ad0
            { _42d58222: /\b(_177a7ea3|_98f38f12|_b5ac69fc|_df905058|_7de97367|_66cd9688|_1809f7cd|_cace491b)\b/gi, type: '_58ee0007', _1aca80e8: '_7448611d _29131ad0' },
            
            // _eb7a842f _46459b1f _29131ad0
            { _42d58222: /\b(_fa8847b0|_6f61ec5c|_267d294a|_e50babab|_ede60ef2|_7b8c1b5b|_52f78812)\b/gi, type: '_f31168c6', _1aca80e8: '_eb7a842f _46459b1f _29131ad0' },
            
            // _b39b7346 _3a2e5f1a
            { _42d58222: /\b(_9f82f7b3|_0c95c7ec|_0af96a8e|_1e2ea6d9|_c0d03c12|_be2bdbb3|_286d4726)\b/gi, type: '_9f82f7b3', _1aca80e8: '_b39b7346 _5c0bf408' },
            
            // _8f6fb4eb _b0079f0f
            { _42d58222: /\b(_d457e3a9|_4b168d88|_823412d1|_4abe6130|_38faba71|_bf86075c|_29a3e147)\b/gi, type: '_5d2d3ceb', _1aca80e8: '_8f6fb4eb _fcf4b1a7' },
            
            // _78ea5ef3 _ce0cff71
            { _42d58222: /\b(_9372c470|_c2fb788c|_925733da|_026f3546|_32cdbc69|_c076501f)\b/gi, type: '_c3e3371f', _1aca80e8: '_78ea5ef3 _ce0cff71' },
            
            // _d4e8830a-_0036bde2 _9eddf573 (_806979ad-_54b759db)
            { _42d58222: /_81b06df4\s*[:=]\s*["']([^"']+)["']/gi, type: '_81b06df4', _1aca80e8: '_dc56dd26 _d4e8830a' },
            { _42d58222: /_c955506f\s*[:=]\s*["']([^"']+)["']/gi, type: '_c955506f', _1aca80e8: '_46459b1f _7f6d0725' },
            { _42d58222: /_4c102969\s*[:=]\s*["']([^"']+)["']/gi, type: '_4c102969', _1aca80e8: '_c91217be _153cdaae' }
        ];
    }

    _634f2ac0(document: vscode.TextDocument): _445be54d {
        const _38366d67 = document._70e5d7b6._bbb522f7();
        
        // _83b12c22 _afafb16a _fed4caac _cd94ec90
        const _d12d72b1 = this._51e1cd2b._2998b323(_38366d67);
        if (_d12d72b1) {
            _02b9f5e8(_d12d72b1);
        }

        // _539c9cb8 _b9776d7d _59ad1b2f _9bf5a24e
        const _cd94ec90 = _e5a1f717(() => {
            this._77848c4e(document);
            this._51e1cd2b._61975955(_38366d67);
        }, this._b79606fb._f44e85c4._4d2dd6ee);

        this._51e1cd2b._6ee0eb49(_38366d67, _cd94ec90);
    }

    private async _77848c4e(document: vscode.TextDocument): Promise<_445be54d> {
        try {
            const _38366d67 = document._70e5d7b6._bbb522f7();
            const _982d9e3e = document._93861f46();

            // _36ecb4f8 _98c41dcd
            if (!_982d9e3e || _982d9e3e._0f82aca6 === 0) {
                return;
            }

            if (_982d9e3e._0f82aca6 > this._b79606fb._f44e85c4._16086a42) {
                console._aa63925e(`_50009ce1 _94c05f1c _d35c416a for _3784070f _f44e85c4: ${_982d9e3e._0f82aca6} _277089d9`);
                return;
            }

            // _9d60841e _5e1ecee0 _a7937b64
            const _4e0f12f4 = this._cfaf3212(_38366d67, _982d9e3e);
            let _978c2f89 = this._5e1ecee0._2998b323(_4e0f12f4);

            if (!_978c2f89) {
                // _6adb770a _f44e85c4 _0695b563 _f77d1bb5
                const _e04f9d64 = this._a5494fd8(_982d9e3e, document._27e22ae4);
                const _4ee3793d = new Promise<_85670b93[]>((_, _084e990a) => {
                    _e5a1f717(() => _084e990a(new _54a0e8c1('_e70d8eb9 _f77d1bb5')), this._b79606fb._4a189871._dae2083a);
                });

                _978c2f89 = await Promise._129ce50d([_e04f9d64, _4ee3793d]);
                
                // _a76ce82a _b9776d7d _c099142b
                this._5e1ecee0._6ee0eb49(_4e0f12f4, _978c2f89);
            }

            this._aa1a95ce(document, _978c2f89);
            
            // _f6f4688f _16091175 (async, _4a2326c6't _716ecabb)
            this._7b73a939._9aa38119(document._27e22ae4, _978c2f89).catch(_ca00fccf => {
                console._aa63925e('_031a8f0f to _27ce1d1b _16091175:', _ca00fccf);
            });

        } catch (_ca00fccf) {
            const _42e468e0 = _46c2d64c._fc1f263d(_ca00fccf);
            console._ca00fccf('_031a8f0f to _fc6d1833 _3784070f _59ad1b2f:', _42e468e0._ab530a13);
        }
    }

    private _cfaf3212(_70e5d7b6: _473287f8, _982d9e3e: _473287f8): _473287f8 {
        // _4759498a a _d04b98f4-_cab26448 _2c70e12b _dd20955d on _d70fbad8 _6201111b _ed7002b4
        const _3a84b2f5 = this._9864e46f(_982d9e3e);
        return `${_70e5d7b6}:${_3a84b2f5}`;
    }

    private _9864e46f(_8c25cb36: _473287f8): _473287f8 {
        let _d04b98f4 = 0;
        for (let i = 0; i < _8c25cb36._0f82aca6; i++) {
            const _411b0496 = _8c25cb36._f52e758e(i);
            _d04b98f4 = ((_d04b98f4 << 5) - _d04b98f4) + _411b0496;
            _d04b98f4 = _d04b98f4 & _d04b98f4; // _5cd425f5 to 32-_d0013c2e _2dba2454
        }
        return _d04b98f4._bbb522f7(36);
    }

    private async _a5494fd8(_982d9e3e: _473287f8, _27e22ae4: _473287f8): Promise<_85670b93[]> {
        const _978c2f89: _85670b93[] = [];
        const _5ea44c39 = _982d9e3e._ad1a6405('\n');

        // _c36d819e _64ebd267 _1554c4e0 for _d7d5dcc3 _4a189871
        for (let i = 0; i < _5ea44c39._0f82aca6; i++) {
            const _38a9c1e7 = _5ea44c39[i];
            
            for (const _1fd38d5c of this._0682bf3e) {
                this._bcaed9f2(_38a9c1e7, i, _1fd38d5c, _978c2f89);
            }
        }

        return _978c2f89;
    }

    private _bcaed9f2(_38a9c1e7: _473287f8, _671326b9: _12886f9d, _1fd38d5c: _8d23df48, _978c2f89: _85670b93[]): _445be54d {
        // _daee7606 _42d58222 _fe3fbb6d to _27ce2525 _206b5ec7 _e0705e68
        _1fd38d5c._42d58222._fe3fbb6d = 0;
        
        let _4945a70f;
        while ((_4945a70f = _1fd38d5c._42d58222._2706c619(_38a9c1e7)) !== _74234e98) {
            _978c2f89._d107ea36({
                type: _1fd38d5c.type,
                _1aca80e8: _1fd38d5c._1aca80e8,
                _38a9c1e7: _671326b9,
                _881d5fb6: _4945a70f._1bc04b52,
                _0f82aca6: _4945a70f[0]._0f82aca6,
                _ff0139d0: this._b79606fb._f44e85c4._20664a28
            });
            
            // _de614763 _704b7acb _254637f7 for global _4589face
            if (!_1fd38d5c._42d58222.global) {
                break;
            }
        }
    }

    private _aa1a95ce(document: vscode.TextDocument, _978c2f89: _85670b93[]): _445be54d {
        const _1553cc62 = vscode.window._cdbd01b5;
        if (!_1553cc62 || _1553cc62.document !== document) {
            return;
        }

        try {
            const _e8dda15c: vscode.DecorationOptions[] = _978c2f89._60be9861(_2a1073a6 => ({
                _2269c0be: new vscode.Range(
                    _d48500ae._9baf3a40(0, _2a1073a6._38a9c1e7),
                    _d48500ae._9baf3a40(0, _2a1073a6._881d5fb6),
                    _d48500ae._9baf3a40(0, _2a1073a6._38a9c1e7),
                    _d48500ae._9baf3a40(0, _2a1073a6._881d5fb6 + _2a1073a6._0f82aca6)
                ),
                _ac672962: `**${_2a1073a6._1aca80e8}** (${_2a1073a6.type}) - _6422e3e7: ${_d48500ae._a97b0931(_2a1073a6._ff0139d0 * 100)}%`
            }));

            _1553cc62._1a65888b(this._66b9756a, _e8dda15c);
        } catch (_ca00fccf) {
            console._ca00fccf('_031a8f0f to _2937013f _e8dda15c:', _ca00fccf);
        }
    }

    _27281161(): _445be54d {
        const _320e00e7 = vscode.window._b6cbdd96(
            '_a2a12dc2',
            '_9c11c99c _2a932f90',
            vscode._41503432._94a72c07,
            { _330d2669: _b5bea41b }
        );

        const _7f1fe30e = this._f410e4f7();
        _320e00e7._0acd1824._e5e23956 = this._62ab8815(_7f1fe30e);
    }

    private _f410e4f7(): _d6a7cd2a {
        // _5fb9c3ab _5ef5ef03 _3673014e _978c2f89
        const _ee28260d: _85670b93[] = [];
        const _61aef1e6 = this._5e1ecee0._48a53f07();
        
        for (const _2c70e12b of _61aef1e6) {
            const _978c2f89 = this._5e1ecee0._2998b323(_2c70e12b);
            if (_978c2f89) {
                _ee28260d._d107ea36(..._978c2f89);
            }
        }

        const _bafa3e7c = _ee28260d._4c7e98bf((_41432230, _2a1073a6) => {
            _41432230[_2a1073a6.type] = (_41432230[_2a1073a6.type] || 0) + 1;
            return _41432230;
        }, {} as _bfdd5106<_473287f8, _12886f9d>);

        return {
            _48ce3aa7: _ee28260d._0f82aca6,
            _bafa3e7c,
            _4b6a66d2: _62a6da87._87d05cd0(_bafa3e7c)
                ._64696494(([,a], [,b]) => b - a)
                ._03fdb065(0, 5),
            _1f85d3d4: {
                _ccdcbe84: this._5e1ecee0._ccdcbe84(),
                _9cba7db6: this._b79606fb._f44e85c4._b62a87f6
            }
        };
    }

    _09d3036c(): _445be54d {
        // _83b12c22 _5ef5ef03 _fed4caac _e17f74aa
        for (const _cd94ec90 of this._51e1cd2b._89445ea0()) {
            _02b9f5e8(_cd94ec90);
        }
        this._51e1cd2b._913a4cb9();

        // _83b12c22 _5e1ecee0
        this._5e1ecee0._913a4cb9();

        // _808e9c29 of _e8dda15c
        this._66b9756a._09d3036c();

        // _808e9c29 of _5770b7ab _fa8f417f
        this._fa8f417f._0842ac64(d => d._09d3036c());
        this._fa8f417f = [];
    }

    private _62ab8815(_7f1fe30e: _d6a7cd2a): _473287f8 {
        const _5ce84c1f = ['_e914d68f', '_56681010', '_a42d5197', '_b04a12f6', '_49a25f9f', '_58ee0007', '_f31168c6', '_9f82f7b3', '_5d2d3ceb', '_c3e3371f'];
        const _944068af = _5ce84c1f._4c7e98bf((_09f5ffef, type) => _09f5ffef + (_7f1fe30e._bafa3e7c[type] || 0), 0);
        const _56bd3c2b = _7f1fe30e._bafa3e7c['_81b06df4'] || 0;
        const _fa6df830 = _7f1fe30e._bafa3e7c['_c955506f'] || 0;
        const _b59abfcc = _7f1fe30e._bafa3e7c['_4c102969'] || 0;
        
        return `
        <!_48060b98 _e5e23956>
        <_e5e23956>
        <_9f2e6d33>
            <_cb86eb2d>
                _230d8358 { _795ea3ef-_d34a569a: -_3a7bd3e2-_bbc5e661, _b50eb34e, '_cc9dab83 UI', _26c12a41, _098e337b-_c7fe1182; _b08c9e29: 20px; }
                ._b8b4e9ce { _89b91df1: #_9b56a3cf; _b08c9e29: 15px; _34e39f66: 10px 0; _4f1a55de-_981979a2: 5px; }
                ._eb0de251-_b8b4e9ce { _89b91df1: #_8fea6bbb; _b08c9e29: 15px; _34e39f66: 10px 0; _4f1a55de-_981979a2: 5px; _4f1a55de-_360f8403: 4px _4b3d4a0d #2196f3; }
                ._81b06df4-_b8b4e9ce { _89b91df1: #_6d8d8ab2; _b08c9e29: 15px; _34e39f66: 10px 0; _4f1a55de-_981979a2: 5px; _4f1a55de-_360f8403: 4px _4b3d4a0d #9c27b0; }
                ._cc57fc19 { _34e39f66: 20px 0; }
                ._fcde2b2e { _89b91df1: #007acc; _39e0f5ef: 20px; _34e39f66: 5px 0; _4f1a55de-_981979a2: 3px; }
                ._eb0de251-_fcde2b2e { _89b91df1: #2196f3; _39e0f5ef: 20px; _34e39f66: 5px 0; _4f1a55de-_981979a2: 3px; }
                ._81b06df4-_fcde2b2e { _89b91df1: #9c27b0; _39e0f5ef: 20px; _34e39f66: 5px 0; _4f1a55de-_981979a2: 3px; }
                ._3fb45623 { _34e39f66: 30px 0; }
                h2 { _74284d9d: #333; _4f1a55de-_be9b7607: 2px _4b3d4a0d #_282b91e0; _b08c9e29-_be9b7607: 10px; }
            </_cb86eb2d>
        </_9f2e6d33>
        <_230d8358>
            <h1>🧠 _9c11c99c _7538c213 - _806979ad _f37695a2</h1>
            
            <_cd35a242 class="_3fb45623">
                <h2>💭 _29131ad0 _d4b1ea57</h2>
                <_cd35a242 class="_b8b4e9ce">
                    <h3>_9c11c99c _2a932f90 _96a5ba63: ${_7f1fe30e._48ce3aa7}</h3>
                    <p>_562e2979 on _b9776d7d _59803041 _e409bfc6 _b1b886ce _4d040d3f _5694d08a _1554c4e0</p>
                </_cd35a242>
            </_cd35a242>

            <_cd35a242 class="_3fb45623">
                <h2>🏗️ _ce0cff71 _29131ad0</h2>
                <_cd35a242 class="_eb0de251-_b8b4e9ce">
                    <h3>_ce0cff71 _83e5d1e7: ${_944068af}</h3>
                    <p>${_944068af > 0 ? '✅ _a2049432 _5694d08a _c4502ad2 _913a4cb9 _9fec08e4 _282bcbc3' : '💭 _75db2abb _0c235578 _9fec08e4 _35e2c3de'}</p>
                </_cd35a242>
                
                ${_944068af > 0 ? `
                <_cd35a242 class="_cc57fc19">
                    <h3>_ce0cff71 _a20d12c5 _160a13d9</h3>
                    ${_5ce84c1f._dfc3376b(type => _7f1fe30e._bafa3e7c[type] > 0)._60be9861(type => `
                        <_cd35a242>
                            <_eda15ce4>${type}</_eda15ce4>: ${_7f1fe30e._bafa3e7c[type]} _46eea9ab
                            <_cd35a242 class="_eb0de251-_fcde2b2e" _cb86eb2d="_dec0f004: ${(_7f1fe30e._bafa3e7c[type] / _944068af) * 100}%"></_cd35a242>
                        </_cd35a242>
                    `)._58393216('')}
                </_cd35a242>
                ` : ''}
            </_cd35a242>

            <_cd35a242 class="_3fb45623">
                <h2>🎯 _d4e8830a _7538c213</h2>
                <_cd35a242 class="_81b06df4-_b8b4e9ce">
                    <h3>_dc56dd26 _8f654d6f: ${_56bd3c2b}</h3>
                    <h3>_46459b1f _bf2b6adc: ${_fa6df830}</h3>
                    <h3>_c91217be _2c7e21f6: ${_b59abfcc}</h3>
                    <p>${(_56bd3c2b + _fa6df830 + _b59abfcc) > 0 ? '✅ _a2049432 _5694d08a _bfb37574 _63c6ce26 _81b06df4-_34f5290a _a77de8a6' : '💭 _75db2abb _0c235578 _81b06df4-_34f5290a _45447b7a to _008231aa _282bcbc3'}</p>
                </_cd35a242>
            </_cd35a242>

            <_cd35a242 class="_3fb45623">
                <h2>🌟 _9c11c99c _e658d3ae</h2>
                <_cd35a242 class="_cc57fc19">
                    <h3>_7189e910 _b8979030 _83e5d1e7</h3>
                    ${_7f1fe30e._4b6a66d2._60be9861(([type, _6c35493a]: [_473287f8, _12886f9d]) => {
                        const _88de714b = _5ce84c1f._9472f22c(type);
                        const _8653b6ae = ['_81b06df4', '_c955506f', '_4c102969']._9472f22c(type);
                        const _e58c1fd1 = _8653b6ae ? '_81b06df4-_fcde2b2e' : (_88de714b ? '_eb0de251-_fcde2b2e' : '_fcde2b2e');
                        return `
                        <_cd35a242>
                            <_eda15ce4>${type}</_eda15ce4>: ${_6c35493a} _18bc3007
                            <_cd35a242 class="${_e58c1fd1}" _cb86eb2d="_dec0f004: ${(_6c35493a / _7f1fe30e._48ce3aa7) * 100}%"></_cd35a242>
                        </_cd35a242>
                    `;})._58393216('')}
                </_cd35a242>

                <_cd35a242 class="_b8b4e9ce">
                    <h3>_143b270a _29131ad0 _7538c213</h3>
                    <ul>
                        ${_62a6da87._87d05cd0(_7f1fe30e._bafa3e7c)._60be9861(([type, _6c35493a]) => {
                            const _88de714b = _5ce84c1f._9472f22c(type);
                            const _8653b6ae = ['_81b06df4', '_c955506f', '_4c102969']._9472f22c(type);
                            const _4030f0c0 = _8653b6ae ? '🎯' : (_88de714b ? '🏗️' : '💻');
                            return `<li>${_4030f0c0} <_eda15ce4>${type}</_eda15ce4>: ${_6c35493a} _18bc3007 of _282bcbc3</li>`;
                        })._58393216('')}
                    </ul>
                </_cd35a242>
            </_cd35a242>

            <_cd35a242 class="_3fb45623">
                <h2>🚀 _806979ad _eeaa51da _38e5a46c</h2>
                <_cd35a242 class="_81b06df4-_b8b4e9ce">
                    <h3>_38e5a46c: ${_d48500ae._a97b0931(((_944068af + _56bd3c2b + _fa6df830 + _b59abfcc) / _d48500ae._9baf3a40(_7f1fe30e._48ce3aa7, 1)) * 100)}%</h3>
                    <p>_aabaa8ff _8044aae1 _edb428be _4d040d3f _5694d08a _c4502ad2 _9fec08e4 _282bcbc3 _6201111b _81b06df4</p>
                </_cd35a242>
            </_cd35a242>
        </_230d8358>
        </_e5e23956>`;
    }
}