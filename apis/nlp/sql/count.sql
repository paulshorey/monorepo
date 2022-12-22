SELECT 
n0.latest,
n1.sentiment,
n2.ws_sentiment_only
FROM 
(SELECT COUNT(*) as latest FROM crawl.words WHERE vrsn=5017) as n0,
(SELECT COUNT(*) as sentiment FROM crawl.words WHERE sentiment IS NOT NULL) as n1,
(SELECT COUNT(*) as ws_sentiment_only FROM crawl.words WHERE sentiment IS NULL AND ws_sentiment IS NOT NULL) as n2
