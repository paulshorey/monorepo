SELECT 
n0.key, n1.key, n2.key
FROM 
(SELECT key FROM data.domains WHERE syns2 ILIKE e'%"theory"%') as n0,
(SELECT key FROM data.domains WHERE syns2 ILIKE e'%"theory"%') as n1,
(SELECT key FROM data.domains WHERE syns3 ILIKE e'%"theory"%') as n2