A more complex implementation of the Select component. This adds a text input and + button to the bottom of options, so user can type a custom value. 


Same props as Select. Pass `suffixIcon={<FontAwesomeIcon icon={faUser} />}` to add an icon to the right of the input. Etc.

EXCEPT: this expects props.values `Array<string>` instead of props.options `Array<{ label: string; value: string; }>`.