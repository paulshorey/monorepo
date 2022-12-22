# TODO
- currently, only domainr.js uses new format { status: {[key]:code} }. Need to update others like name.js and whois/host

```
/*
 * LEGEND
 */
   -1 = unknown, not able to check
    0 = new, did not check
    1 = unavailable
    2 = available
    3 = registry premium (buy it now for higher price than such TLD normally sells for)
    4 = aftermarket premium (buy it now or make an offer, also could be in an auction)
    5 = registry premium marketed (must submit offer, more expensive than regular premium SLDs)
    6 = unavailable, but expiring soon
```

```
/*
 * REQUEST DATA
 */
{
  "domains": ["besta.domains", "greata.domains", "perfect.domains", "true.domains", "new.domains"]
}
```

```
/*
 * RESPONSE DATA (DOMAINR)
 */
{
  "status": {
    "besta.domains": 1,
    "greata.domains": 2,
    "perfect.domains": 3,
    "true.domains": 4,
    "new.domains": 5,
  }
}
```

```
/*
 * RESPONSE DATA (NAME.COM) (coming soon!)
 */
{
  "status": {
    "besta.domains": 1,
    "greata.domains": 2,
    "perfect.domains": 3,
    "true.domains": 1,
    "new.domains": 1,
  },
  "price": {
    "greata.domains": 30,
    "perfect.domains": 1000,
  }
}
```

```
/*
 * RESPONSE DATA (WHOIS / HOST)
 */
{
  "status": {
    "besta.domains": 1,
    "greata.domains": 2,
    "perfect.domains": 3,
    "true.domains": 4,
    "new.domains": 5,
  },
  "aftermarket": {
    "true.domains": "dan.com",
    "new.domains": "name.com",
  },
}
```

# COMBINED RESULTS

```
-2 = error: something broke
-1 = error: unable to check

0 = new request, not checked

1 = available: price unknown
2 = available: registry premium, price unknown
3 = available: aftermarket/auction premium, price unknown

10-10000000 = available: value is purchase price

10000001 = unavailable
10000002 = unavailable: invalid or disallowed
10000003 = unavailable: registry reserved
10000004 = unavailable: claimed, trademarked, etc
10000005 = unavailable: owned by besta.domains
10000006 = unavailable: is alias of some other TLD

100000000+ = unavailable: value is expiration date as UNIX timestamp
```

# DOMAINR.COM / NAME.COM

Sometimes Domainr says "unavailable" even thought status is "premium aftermarket"

```
0 = new request, not checked

1 = available: price unknown

11 = unavailable: according to Domainr/Name.com, but could be listed in aftermarket!
12 = unavailable: invalid or disallowed
13 = unavailable: registry reserved
14 = unavailable: claimed, trademarked, etc
15 = unavailable: owned by besta.domains
16 = unavailable: is alias of some other TLD

21 = available: registry premium, price unknown
22 = available: aftermarket/auction premium, price unknown

100-10000000 = available: value is purchase price
```

# WHOIS / HOST NS

Can not be used to check if "available". Only checks if "unavailable" or "premium".

```
-1 = unknown

0 = new request, not checked

11 = unavailable: connected to a server, but could be listed in aftermarket!
12 = unavailable: invalid or disallowed
13 = unavailable: registry reserved
14 = unavailable: claimed, trademarked, etc
15 = unavailable: owned by besta.domains
16 = unavailable: is alias of some other TLD

21 = available: registry premium, price unknown
22 = available: aftermarket/auction premium, price unknown

100000000+ = unavailable: value is expiration date as UNIX timestamp
```
