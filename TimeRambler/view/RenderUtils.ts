class RenderUtils {

    /*
    public static beautifyFloat(num: number): string {
        var absVal: number = Math.abs(num);
        if (absVal < 1)
            return num.toFixed(3);
        if (absVal < 10)
            return num.toFixed(2);
        if (absVal < 100)
            return num.toFixed(1);
        if (absVal < 10000)
            return num.toFixed(0);
        if (absVal < 100000)
            return Math.floor(num / 1000).toFixed(1) + "K";
        if (absVal < 1000000)
            return Math.floor(num / 1000).toFixed(0) + "K";
        if (absVal < 10000000)
            return Math.floor(num / 1000000).toFixed(1) + "M";
        
        return Math.floor(num / 1000000).toFixed(1) + "M";
    }

    public static beautifyInt(num: number): string {
        var absVal: number = Math.abs(num);
        if (absVal < 1000)
            return num.toFixed(0);
        if (absVal < 1000000)
            return Math.floor(num / 1000).toFixed(0) + "K";
        return Math.floor(num / 1000000).toFixed(0) + "M";
    }*/


    /**
     * Converts raw resource value (e.g. 12345.67890) to a formatted representation (i.e. 12.34K)
     * Shamelessly copied from kittens game where the core of it was in turn copied from Sandcastle Builder
     */
    private static postfixes :Array<any> = [
           // { limit: 1e210, divisor: 1e210, postfix: ['Q', ' Quita'] },
           // { limit: 1e42, divisor: 1e42, postfix: ['W', ' Wololo'] },
           // { limit: 1e39, divisor: 1e39, postfix: ['L', ' Lotta'] },
           // { limit: 1e36, divisor: 1e36, postfix: ['F', ' Ferro'] },
           // { limit: 1e33, divisor: 1e33, postfix: ['H', ' Helo'] }, //or Ballard
           // { limit: 1e30, divisor: 1e30, postfix: ['S', ' Squilli'] },
           // { limit: 1e27, divisor: 1e27, postfix: ['U', ' Umpty'] },
           // { limit: 1e24, divisor: 1e24, postfix: ['Y', ' Yotta'] },
           // { limit: 1e21, divisor: 1e21, postfix: ['Z', ' Zeta'] },
           // { limit: 1e18, divisor: 1e18, postfix: ['E', ' Exa'] },
           // { limit: 1e15, divisor: 1e15, postfix: ['P', ' Peta'] },
           // { limit: 1e12, divisor: 1e12, postfix: ['T', ' Tera'] },
           // { limit: 1e9, divisor: 1e9, postfix: ['G', ' Giga'] },
            { limit: 1e6, divisor: 1e6, postfix: ['M', ' Mega'] },
            { limit: 9e3, divisor: 1e3, postfix: ['K', ' Kilo'] },
    ];

    public static precision: number = 2; 
    public static beautifyFloat(num: number): string {

        if (!num) { return "0"; }

        var len: number = RenderUtils.postfixes.length;
        for (var i: number = 0; i < len; i++) {
            var p = RenderUtils.postfixes[i];
            if (num >= p.limit) {
                return RenderUtils.beautifySimpleFloat(num / p.divisor) + p.postfix[0];
            }
        }
        return RenderUtils.beautifySimpleFloat(num);
    }

    private static beautifySimpleFloat(num: number): string {
        if (Math.floor(num) == num)
            return num.toFixed();
        else
            return num.toFixed(RenderUtils.precision);
    }

}   