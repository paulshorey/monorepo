-- UPDATE crawl.words SET attempts=0,timestamp=10,error='Timed out: crawl.js',results='{}' WHERE results=e'{"error":"Something broke. Probably ProxyCrawl timed out."}';

SELECT key,results,list,sources_success,root,plural,proper,abbreviation,alt,best,translated,pos1,pos2,pos3,sources, vrsn,attempts,timestamp,error FROM crawl.words 
WHERE results=e'{"error":"Something broke. Probably ProxyCrawl timed out."}';
-- WHERE error IS NOT NULL AND error!='';