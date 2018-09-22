'use strict';

const assert = require('assert');

const Cipher = module.exports = function(pres, groups) {
    assert(pres > 0 && groups > 0, 'Init Cipher instance fail.');
    this.prefixs = pres;
    this.groups = groups;
};

Cipher.prototype = {
    constructor: Cipher,
    encode: function(src, vector) {
        if (!src.length) return null;
        const rules = Cipher.preset.rules,
            fir = rules.prefix(
                src.substring(0, this.prefixs),
                letter => rules.transform(letter, vector)
            ),
            sec = src.split('').map(cur =>
                rules.transform(cur, vector)
            ).join('');
        return rules.group(fir + sec, this.groups);
    },
    decode: function(ar) {
        const vaild = [
            this.groups, this.groups - 1
        ].indexOf(ar.length) > -1;
        assert(vaild, 'Decode array is invaild.');
        const rules = Cipher.preset.rules,
            src = ar.join(''),
            vector = rules.prefix(
                src.substring(0, this.prefixs * 2),
                (fir, sec) => rules.transform(fir, sec),
                false
            );
        return src.substring(this.prefixs * 2)
            .split('').map(cur =>
                rules.transform(cur, -vector)
            ).join('');
    }
};

Cipher.preset = {
    template: 'abcdefghijklmnopqrstuvwxyz',
    rules: {
        prefix: function(src, callback, mk = true) {
            src = mk ? src.toLowerCase() : src;
            const temp = src.match(
                new RegExp(`(.|\n)${ mk ? '' : '{2}' }`, 'g')
            ).map(cur => mk ?
                cur + callback(cur) :
                callback(...cur)
            );
            return mk ? temp.join('') : temp[0];
        },
        transform: function(letter) {
            let template = Cipher.preset.template,
                index;
            const [fir, sec] = [].slice.call(arguments, 0, 2),
                len = template.length,
                find = (letter, series) => [
                    series.toLowerCase(),
                    series.toUpperCase()
                ].reduce((res, cur) => {
                    if (res) return res;
                    const index = cur.indexOf(letter);
                    return index > -1 ? [index, cur] : null;
                }, null),
                res = find(fir, template),
                vector = typeof sec === 'string';
            if (!res) return vector ? null : fir;
            [index, template] = res;
            const last = vector ?
                template.indexOf(sec) : (index + sec) % len;
            return vector ?
                (last > -1 ? last - index : null) :
                (last < 0 ? template[len + last] : template[last]);
        },
        group: function(src, count) {
            const len = src.length,
                _ = len % count;
            let per = len / count;
            _ && (per = Math.floor(per) + 1);
            const temp = Array(count).fill(per);
            if (_) {
                const last = len - per * (count - 1);
                (last && (temp[count - 1] = last)) ||
                (delete temp[count - 1]);
            }
            return temp.reduce((ctx, cur, i) => {
                ctx[1][i] = src.substring(
                    ctx[0], ctx[0] + cur
                );
                ctx[0] += cur;
                return ctx;
            }, [0, []])[1];
        }
    }
};