"use strict";

const totalTasksText = "20";
const completedTasksText = "11";

if (
    typeof totalTasksText !== "string" ||
    typeof completedTasksText !== "string"
) {
    console.log("Ошибка: входные данные должны быть строками.");
} else {

    const totalTrimmed = totalTasksText.trim();
    const completedTrimmed = completedTasksText.trim();

    if (totalTrimmed === "" || completedTrimmed === "") {
        console.log("Ошибка: пустой ввод.");
    } else {

        const totalTasks = Number(totalTrimmed);
        const completedTasks = Number(completedTrimmed);

        if (
            !Number.isFinite(totalTasks) ||
            !Number.isFinite(completedTasks)
        ) {
            console.log("Ошибка: введено некорректное число.");
        }

        else if (
            !Number.isInteger(totalTasks) ||
            !Number.isInteger(completedTasks)
        ) {
            console.log("Ошибка: количество задач должно быть целым.");
        }

        else if (totalTasks < 0 || completedTasks < 0) {
            console.log("Ошибка: количество задач не может быть отрицательным.");
        }

        else if (totalTasks > 1000) {
            console.log("Ошибка: превышена верхняя граница.");
        }

        else if (completedTasks > totalTasks) {
            console.log("Ошибка: выполнено больше задач, чем существует.");
        }

        else if (totalTasks === 0 && completedTasks === 0) {
            console.log("Задач пока нет.");
        }

        else {
            const remainingTasks = totalTasks - completedTasks;
            const progress = completedTasks / totalTasks * 100;

            let status;

            if (completedTasks === 0) {
                status = "Не начато";
            } else if (completedTasks === totalTasks) {
                status = "Завершено";
            } else {
                status = "В работе";
            }

            console.log("Всего задач:", totalTasks);
            console.log("Выполнено:", completedTasks);
            console.log("Осталось:", remainingTasks);
            console.log("Прогресс:", progress.toFixed(1) + "%");
            console.log("Статус:", status);
        }
    }
}