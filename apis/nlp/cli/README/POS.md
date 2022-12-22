https://rapidapi.com/textanalysis/api/textanalysis?endpoint=53aa5d99e4b051a76d241975  
(failed with "something blue")  
https://rapidapi.com/textanalysis/api/textanalysis?endpoint=567ce9ebe4b0c2a9f0e847ca  
(failed with "damp")  
  
  
## something blue  
something (78% sure its noun - take that even though POS JS says its verb)  
blue (67% sure its adjective - POS JS also thinks its adjective)  
  
## wet and damp  
damp (59% sure its adjective - even though POS JS thinks its verb)  
  
## peed  
peed (41% sure its noun - if less than 50%, us POS JS (verb))  
  
## pressurized  
(58% sure its verb - same with posjs - but root word is "pressurize" which is actual verb)  
  
  
# VERB, if has root, prefer root  
# NOUN, if has root, prefer root  
# ADJECTIVE, see pressurized above  
# Perhaps, ALWAYS prefer root???  
# NO, that won't help even with pressurized. Just merge the results query/root.  
  
  
  
  
