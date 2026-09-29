"use strict";

console.log("1. Выражение: \"8\" + 2");
console.log("Результат:", "8" + 2);
console.log("Тип результата:", typeof ("8" + 2));

console.log("\n2. Выражение: \"8\" - 2");
console.log("Результат:", "8" - 2);
console.log("Тип результата:", typeof ("8" - 2));

console.log("\n3. Выражение: Number(\"8\") + 2");
console.log("Результат:", Number("8") + 2);
console.log("Тип результата:", typeof (Number("8") + 2));

console.log("\n4. Выражение: \"12\" > \"3\"");
console.log("Результат:", "12" > "3");
console.log("Тип результата:", typeof ("12" > "3"));

console.log("\n5. Выражение: 12 === \"12\"");
console.log("Результат:", 12 === "12");
console.log("Тип результата:", typeof (12 === "12"));

console.log("\n6. Выражение: Number(\"\")");
console.log("Результат:", Number(""));
console.log("Тип результата:", typeof Number(""));

console.log("\n7. Выражение: Number(\"text\")");
console.log("Результат:", Number("text"));
console.log("Тип результата:", typeof Number("text"));

console.log("\n8. Выражение: Boolean(\"false\")");
console.log("Результат:", Boolean("false"));
console.log("Тип результата:", typeof Boolean("false"));

console.log("\n9. Выражение: typeof null");
console.log("Результат выражения:", typeof null);
console.log("Тип самого результата:", typeof (typeof null));

console.log("\n10. Выражение: typeof NaN");
console.log("Результат выражения:", typeof NaN);
console.log("Тип самого результата:", typeof (typeof NaN));