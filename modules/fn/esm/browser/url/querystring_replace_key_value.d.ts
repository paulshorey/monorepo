/**
 * Change a url (GET) parameter in queryString string
 * @param queryString - ex: `?start=10&fruit=apple`
 * @param key - ex: `fruit`
 * @param value - ex: `species`
 * @return - ex: `?start=10&species=apple`
 */
export default function (queryString: string, key: string, value: string): string;
