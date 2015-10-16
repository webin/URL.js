/**
 *  URL parser.
 *
 *  Usage:
 *
 *     var url = URL("https://example.com/path/index.php?var1=223#hash") ->
 *     {
 *       "protocol": "https:",
 *       "username": "",
 *       "password": "",
 *       "host"    : "example.com",
 *       "hostname": "example.com",
 *       "port"    : "",
 *       "pathname": "/path/index.php",
 *       "search"  : "?var1=223",
 *       "query"   : "var1=223",
 *       "hash"    : "#hash",
 *       "path"    : "/path/index.php?var1=223",
 *       "origin"  : "https://example.com",
 *       "domain"  : "example.com",
 *       "href"    : "https://example.com/path/index.php?var1=223#hash"
 *     }
 *
 *     String(url) -> "https://example.com/path/index.php?var1=223#hash"
 *
 *     URL.parseUrl("https://example.com/path/index.php?var1=223#hash", "origin") -> "https://example.com"
 *
 *     URL.is_url('http://example.com') -> true
 *     URL.is_domain('example.com')     -> true
 *
 *     URL.fromObject({a:1,b:4}, "?")   -> "?&a=1&b=4"
 *     URL.toObject('a=1&b=4')          -> {a: 1, b: 4}
 *
 *
 *
 *  @license MIT
 *  @version 0.0.8
 *  @author Dumitru Uzun (DUzun.Me)
 *  @umd AMD, Browser, CommonJs, noDeps
 */
// ---------------------------------------------------------------------------
;(function (name, global, String, Object, RegExp) {
    // ---------------------------------------------------------------------------
    // Some globals:
    var toString           = {}.toString
    ,   trim               = ''.trim
    ,   encodeURIComponent = global.encodeURIComponent
    ,   decodeURIComponent = global.decodeURIComponent
    ;

    // UMD:
    (typeof define !== 'function' || !define.amd
        ? typeof module == 'undefined' || !module.exports
            ? function (deps, factory) { global[name] = factory(); } // Browser
            : function (deps, factory) { module.exports = factory(); } // CommonJs
        : define // AMD
    )
    /*define*/(/*name, */[], function factory() {

        // Constructor
        function URL(url) {
            if ( url ) return URL.parseUrl(url);
        }

        var undefined // anti-`asshole effect` (undefined = true;)
        // ---------------------------------------------------------------------------
        ,   _ = URL
        ,   __ = _.prototype
        // ---------------------------------------------------------------------------
        ,   NIL = ''
        // ---------------------------------------------------------------------------
        ,   _is_url_r_    = /^[\w.+\-]{3,20}\:\/\/[a-z0-9]/i
        ,   _is_domain_r_ = /^[a-z0-9][0-9a-z_\-]*(?:\.[a-z0-9][0-9a-z_\-]*)*$/
        // ---------------------------------------------------------------------------
        ,   __ex = typeof Object.defineProperty == 'function'
              ? function (name, func, proto) {
                  Object.defineProperty(proto||__, name, {
                      value: func,
                      configurable: true,
                      enumerable: false,
                      writeable: true
                  })
              }
              : function (name, func, proto) {
                  // Take care with (for ... in) on strings!
                  (proto||__)[name] = func;
              }
        ;
        // ---------------------------------------------------------------------------
        if ( typeof trim != 'function' ) {
            var _ws_  = "\x09-\x0D\x20\xA0"
            ,   _lwsr_ = new RegExp('^['+_ws_+']+')
            ,   _rwsr_ = new RegExp('['+_ws_+']+$')
            ;
            _.trim =
            trim = function () {
                return String(this).replace(_lwsr_, NIL).replace(_rwsr_, NIL);
            };
        }
        // ---------------------------------------------------------------------------
        var _parse_url_exp = new RegExp([
                '^([\\w.+\\-\\*]+:)//'          // protocol
              , '(([^:/?#]*)(?::([^/?#]*))?@|)' // username:password
              , '(([^:/?#]*)(?::(\\d+))?)'      // host == hostname:port
              , '(/[^?#]*|)'                    // pathname
              , '(\\?([^#]*)|)'                 // search & query
              , '(#.*|)$'                       // hash
            ].join(NIL))
        ,   _parse_url_map = {
                protocol: 1
              , username: 3
              , password: 4
              , host    : 5
              , hostname: 6
              , port    : 7
              , pathname: 8
              , search  : 9
              , query   : 10
              , hash    : 11
            }
        ;

        // ---------------------------------------------------------------------------
        function _uri_to_string_() {
            return _.fromLocation(this)
        }
        __ex('toString', _uri_to_string_);
        __ex('valueOf', _uri_to_string_);

        // ---------------------------------------------------------------------------
        _.parseUrl = function parseUrl(href, part, parseQuery) {
            href = String(href);
            var match = href.match(_parse_url_exp)
            ,   map = _parse_url_map
            ,   i, ret = false
            ;
            if(match) {
                if(part && part in map) {
                    ret = match[map[part]] || NIL;
                    if ( part == 'pathname' ) {
                        if(!ret) ret = '/';
                    }
                    if ( parseQuery && part == 'query' ) {
                        ret = _.toObject(ret||NIL);
                    }
                }
                else {
                    ret = new URL();
                    for(i in map) if(map.hasOwnProperty(i)) {
                        ret[i] = match[map[i]] || NIL
                    }
                    if(!ret.pathname) ret.pathname = '/';
                    ret.path = ret.pathname + ret.search;
                    ret.origin = ret.protocol + '//' + ret.host;
                    ret.domain = ret.hostname.replace(/^www./, NIL).toLowerCase();
                    if ( parseQuery ) ret.query = _.toObject(ret.query||NIL);
                    ret.href = String(href); // ??? may need some parse
                    if(part) ret = ret[part];
                }
            }
            return ret
        }

        _.fromLocation = function (o) {
            var url = [], t, s;
            if(t = o.protocol) url[url.length] = t.toLowerCase() + '//';
            if((t = o.username) || o.password) {
                url[url.length] = t || NIL;
                if(t = o.password) url[url.length] = ':' + t;
                url[url.length] = '@';
            }
            if(t = o.hostname) {
                url[url.length] = t.toLowerCase();
                if(t = o.port) url[url.length] = ':' + t;
            }
            else
            if(t = o.host) url[url.length] = t.toLowerCase();

            if(t = o.pathname) url[url.length] = (t.substr(0,1) == '/' ? NIL : '/') + t;
            if(t = o.search || o.query)   {
                if(typeof t == 'object') {
                    t = _.fromObject(t);
                }
                url[url.length] = (t.substr(0,1) == '?' ? NIL : '?') + t;
            }
            if(t = o.hash) url[url.length] = (t.substr(0,1) == '#' ? NIL : '#') + t;

            return url.join(NIL);
        }
        // ---------------------------------------------------------------------------
        _.toObject = function (str, sep, eq, ndec) {
            if(sep == undefined) sep = '&';
            if(eq == undefined) eq = '=';
            var j = String(str).split(sep)
            ,   i = j.length
            ,   a = {}
            ,   t
            ;
            ndec = ndec ? function (v) { return String(v).replace(/%26/g, '&') } : decodeURIComponent;
            while(i-->0) if(t = trim.call(j[i])) {
                t = t.split(eq);
                j[i] = trim.call(t.splice(0,1)[0]);
                t = t.join(eq);
                a[ndec(j[i])] = ndec(trim.call(t));
            }
            return a;
        };

        _.fromObject = function (o, pref, nenc) {
            var r = Object.keys(o),
                i = r.length,
                n, v, u;
            r.sort();
            nenc = nenc ? function (v) { return String(v).replace(/\&/g, '%26') } : encodeURIComponent;
            for ( ; i--; ) {
               n = r[i];
               v = o[n];
               if(v == null) r.splice(i,1);
               else {
                  n = nenc(n);
                  if(v !== NIL) n += '=' + nenc(v);
                  r[i] = n;
               }
            }
            // Object.each(o, nenc ? function(n,v) { if(v != u) n += '=' + v; r[++i] = n } :
                // function(n,v) { n = encodeURIComponent(n); if(v != u) n += '=' + encodeURIComponent(v); r[++i] = n }
            // );
            r = r.join('&');
            if(pref) r = pref + (typeof pref != 'string' || pref.indexOf('?') < 0 ? '?' : '&') + r;
            return r
        };
        // ---------------------------------------------------------------------------
        _.is_url     = function _is_url(str)    { return _is_url_r_.test(str)    };
        _.is_domain  = function _is_domain(str) { return _is_domain_r_.test(str) };
        // ---------------------------------------------------------------------------
        // ---------------------------------------------------------------------------
        return _;
    });
    // ---------------------------------------------------------------------------
}
('URL', typeof self == 'undefined' ? typeof global == 'undefined' ? this : global : self, String, Object, RegExp));
// ---------------------------------------------------------------------------