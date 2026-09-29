"use strict";

const totalTasks = 20;
const completedTasks = 11;
const dailyLimit = 6;

if (
    typeof totalTasks !== "number" ||
    typeof completedTasks !== "number"
) {
    console.log("Ошибка: количество задач должно быть числом.");
}

else if (
    !Number.isFinite(totalTasks) ||
    !Number.isFinite(completedTasks)
) {
    console.log("Ошибка: недопустимое числовое значение.");
}

else if (
    !Number.isInteger(totalTasks) ||
    !Number.isInteger(completedTasks)
) {
    console.log("Ошибка: количество задач должно быть целым числом.");
}

else if (totalTasks < 0 || completedTasks < 0) {
    console.log("Ошибка: количество задач не может быть отрицательным.");
}

else if (totalTasks > 1000) {
    console.log("Ошибка: превышена верхняя граница количества задач.");
}

else if (completedTasks > totalTasks) {
    console.log("Ошибка: некорректное число выполненных задач.");
}

// Проверяем dailyLimit
else if (typeof dailyLimit !== "number") {
    console.log("Ошибка: дневная норма должна быть числом.");
}

else if (!Number.isFinite(dailyLimit)) {
    console.log("Ошибка: недопустимое значение дневной нормы.");
}

else if (!Number.isInteger(dailyLimit)) {
    console.log("Ошибка: дробной дневной нормы быть не должно.");
}

else if (dailyLimit < 1) {
    console.log("Ошибка: дневная норма должна быть не меньше 1.");
}

else if (dailyLimit > 1000) {
    console.log("Ошибка: превышена верхняя граница нормы.");
}

else {
    let remainingTasks = totalTasks - completedTasks;
    let day = 0;

    console.log("Осталось задач:", remainingTasks);

    if (remainingTasks === 0) {
        console.log("Все задачи уже выполнены.");
        console.log("Потребуется дней: 0");
    }

    else {
        while (remainingTasks > 0) {
            day++;
            const tasksToday = Math.min(dailyLimit, remainingTasks);

            remainingTasks = remainingTasks - tasksToday;

            console.log(
                "День " + day +
                ": выполнено " + tasksToday +
                ", осталось " + remainingTasks
            );
        }

        console.log("Потребуется дней:", day);
    }
}