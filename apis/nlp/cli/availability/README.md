###

##

# WHOIS NOT SUPPORTED (always 0)

name
so

## WHOIS SPECIAL

to - whois record is very short, contains only a couple lines of nameservers, without mentioning the term "nameservers"

###

##

# HOST NOT SUPPORTED (always 0, can't check SLDs reserved by the registry)

community.fun

So,

1. WHOIS check each if " reserved " by registry/registrar, then give either 1 or 1000. Not sure.
2. HOST ignore if reserved or registered from WHOIS.

If either WHOIS or HOST is not able to check a TLD, then use Name/Domainr

###

##

# COMBINE HOST+WHOIS

```
let code = 0;
/*
 * FIRST, ATTEMPT TO GET STATUS FROM (FREE) UNIX CLI UTILITIES
 * use the more specific status code, from either source, even if number is lower value
 * if one replies 10 (available), but other replies 7 (reserved), use: 7
 * 10000000 (aftermarket, price unknown), vs: 4995 (aftermarket, price found), use: 4995
 * REFER TO README/API-DOCUMENTATION FOR CODE MEANING
 */
let host: any = await cli_host(dom) || 0
let whois: any = await cli_whois(dom) || 0
let host_exact = host!==10 && host!==501 && host!==1501 ? host : 0
let whois_exact = whois!==10 && whois!==501 && whois!==1501 ? whois : 0
code = Math.max(host_exact, whois_exact)
if (!code) {
    code = Math.max(host, whois)
}
/*
 * IF NO LUCK, QUERY NAME API (FREE, but doesnt include all TLDs), OR USE DOMAINR (PAID)
 */
if (!code) {
    code = tlds_name[tld] ? await api_name(dom) : 0
    if (!code) {
        code = tlds_domainr[tld] ? await api_domainr(dom) : 0
    }
}
```
