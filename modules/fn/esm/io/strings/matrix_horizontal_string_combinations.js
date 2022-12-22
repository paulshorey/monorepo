/**
 * Flatten a matrix from left to right - generate list of all unique combinations of strings
 * @params matrix {array} - array of arrays of strings, in a matrix format
 * @params delimeter {string} - Default: " ". Separate the combined values.
 * @returns - array of string combinations, separated by space
 */
export default function matrix_horizontal_string_combinations(matrix, delimeter = " ") {
    // process each column
    if (!matrix.length) {
        return [];
    }
    else if (matrix.length === 1) {
        return matrix[0];
    }
    else {
        let result = [];
        let allCasesOfRest = matrix_horizontal_string_combinations(matrix.slice(1), delimeter); // recursively push values
        for (let i = 0; i < allCasesOfRest.length; i++) {
            for (let j = 0; j < matrix[0].length; j++) {
                result.push(matrix[0][j] + delimeter + allCasesOfRest[i]);
            }
        }
        return result;
    }
}
