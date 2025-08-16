// navigation.js
document.addEventListener("keydown", function(e) {
    const editableCells = Array.from(document.querySelectorAll("td div[contenteditable], td[contenteditable]"));
    const currentIndex = editableCells.indexOf(document.activeElement);

    if (currentIndex === -1) return;

    const cols = editableCells.reduce((acc, cell, i) => {
        const rect = cell.closest("td").getBoundingClientRect();
        acc.push({ x: rect.left, y: rect.top, index: i });
        return acc;
    }, []);

    const currentCell = cols[currentIndex];
    let nextIndex = null;

    switch (e.key) {
        case "ArrowRight":
            nextIndex = currentIndex + 1 < editableCells.length ? currentIndex + 1 : null;
            break;
        case "ArrowLeft":
            nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : null;
            break;
        case "ArrowDown":
            nextIndex = cols.find(c => c.x === currentCell.x && c.y > currentCell.y)?.index;
            break;
        case "ArrowUp":
            for (let i = currentIndex - 1; i >= 0; i--) {
                if (cols[i].x === currentCell.x && cols[i].y < currentCell.y) {
                    nextIndex = i;
                    break;
                }
            }
            break;
    }

    if (nextIndex !== null) {
        e.preventDefault();
        editableCells[nextIndex].focus();
    }
});
