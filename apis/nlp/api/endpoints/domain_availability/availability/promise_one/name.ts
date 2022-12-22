import check_many from "../promise_many/name"

/*
 * Unlike other modules in this folder 'promises_one',
 * which host their own request logic,
 * and are used by modules from 'promises_many',
 * "name" source is kept in the 'promises_many' folder.
 * Refer to that as the original source.
 */
export default async function (domstr) {
  return await check_many([domstr])
}
