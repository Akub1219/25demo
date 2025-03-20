// クラフト機能の変数定義
const craftButton = document.getElementById('craft-button');
const craftScreen = document.getElementById('craft-screen');
const craftGrid = document.getElementById('craft-grid');
const craftResult = document.getElementById('craft-result');
const closeButton = craftScreen.querySelector('.close-button');
const craftArea = document.getElementById('craft-area');
let selectedSlots = [];
let materialsUsed = false; // クラフト素材が使用済みかどうかのフラグ

// クラフトボタンクリック時の処理
craftButton.addEventListener('click', () => {
    craftScreen.style.display = 'flex';
    selectedSlots = [];
    // クラフト開始時に素材使用フラグをリセット
    materialsUsed = false;

    // グリッドのリセット
    Array.from(craftGrid.children).forEach(slot => {
        slot.classList.remove('active');
        slot.textContent = ''; // アイテム表示を消去
        slot.removeAttribute('data-item-type');
    });

    // クラフト結果をリセット
    craftResult.innerHTML = '';
    const resultIcon = document.createElement('div');
    resultIcon.className = 'result-icon';
    resultIcon.textContent = '？';
    craftResult.appendChild(resultIcon);
    craftResult.classList.remove('active');
    craftResult.removeAttribute('data-recipe');

    // インベントリをクラフト画面にコピー
    updateCraftInventory();
});

// 閉じるボタンクリック時の処理
closeButton.addEventListener('click', () => {
    // クラフト画面を閉じる前に、スロットに配置された素材をインベントリに戻す
    // ただし、素材が使用済みの場合は戻さない
    if (!materialsUsed) {
        Array.from(craftGrid.children).forEach(slot => {
            if (slot.classList.contains('active')) {
                const itemType = slot.getAttribute('data-item-type');

                // アイテムをインベントリに戻す（クラフトをキャンセルした場合）
                if (itemType) {
                    inventoryCounts[itemType]++;
                }

                // スロットをリセット
                slot.classList.remove('active');
                slot.textContent = '';
                slot.removeAttribute('data-item-type');
            }
        });
    }

    craftScreen.style.display = 'none';
    // マップ画面のインベントリを更新
    updateInventory();

    // デバッグ用: 現在のインベントリ状態をログに出力
    console.log("閉じる時のインベントリ状態:", {
        ...inventoryCounts,
        materialsUsed: materialsUsed
    });

    // 素材使用フラグをリセット（次回クラフト用）
    materialsUsed = false;
});

// クラフトグリッドのスロットクリック時の処理
craftGrid.addEventListener('click', (event) => {
    const slot = event.target;
    if (slot.classList.contains('craft-slot')) {
        const index = Array.from(craftGrid.children).indexOf(slot);
        if (selectedSlots.includes(index)) {
            // すでに選択されているスロットを再度クリックした場合、選択を解除して元のアイテムをインベントリに戻す
            selectedSlots = selectedSlots.filter(i => i !== index);

            // 戻すアイテムのタイプを取得
            const itemType = slot.getAttribute('data-item-type');

            // アイテムをインベントリに戻す
            if (itemType) {
                inventoryCounts[itemType]++;
            }

            // スロットをリセット
            slot.classList.remove('active');
            slot.textContent = '';
            slot.removeAttribute('data-item-type');

            // インベントリとクラフト結果を更新
            updateInventory();
            updateCraftInventory();
            updateCraftResult();
        }
    }
});

// クラフト結果クリック時の処理
craftResult.addEventListener('click', () => {
    if (craftResult.classList.contains('active')) {
        const recipe = craftResult.getAttribute('data-recipe');

        if (recipe === 'wood-to-plank') {
            // 木材1つを消費して板材4つを作成
            inventoryCounts.plank += 4;
            alert('板材4個をクラフトしました！');
        } else if (recipe === 'plank-to-workbench') {
            // 板材4つを消費して作業台1つを作成
            inventoryCounts.workbench += 1;
            alert('作業台をクラフトしました！');
        } else if (recipe === 'plank-to-stick') {
            // 板材2つを消費して棒1つを作成
            inventoryCounts.stick += 1;
            alert('棒をクラフトしました！');
        } else if (recipe === 'wooden-pickaxe') {
            // 板材3つと棒2つを消費して木のツルハシ1つを作成
            inventoryCounts.wooden_pickaxe += 1;
            alert('木のツルハシをクラフトしました！');
        }

        // 素材使用済みとマーク
        materialsUsed = true;

        // クラフトグリッドをリセット
        selectedSlots = [];
        Array.from(craftGrid.children).forEach(slot => {
            slot.classList.remove('active');
            slot.textContent = '';
            slot.removeAttribute('data-item-type');
        });

        // クラフト結果をリセット
        craftResult.innerHTML = '';
        const resultIcon = document.createElement('div');
        resultIcon.className = 'result-icon';
        resultIcon.textContent = '？';
        craftResult.appendChild(resultIcon);
        craftResult.classList.remove('active');
        craftResult.removeAttribute('data-recipe');

        // インベントリを更新
        updateInventory();

        // デバッグ用: クラフト完了時のインベントリ状態
        console.log("クラフト完了時のインベントリ状態:", {
            ...inventoryCounts,
            materialsUsed: materialsUsed
        });
    }
});

// クラフト画面用のインベントリを更新する関数
function updateCraftInventory() {
    const craftInventory = document.getElementById('craft-inventory');
    craftInventory.innerHTML = ''; // 既存の内容をクリア

    // アイテムの順番に基づいて、実際のインベントリの有効なアイテムリストを作成
    const activeItems = [];

    itemOrdering.forEach(itemType => {
        if (inventoryCounts[itemType] > 0) {
            activeItems.push({
                type: itemType,
                count: inventoryCounts[itemType],
                icon: itemIcons[itemType],
                name: itemNames[itemType]
            });
        }
    });

    // 9個のスロットを作成（アイテムがあるものとないもの）
    for (let i = 0; i < 9; i++) {
        let item;

        if (i < activeItems.length) {
            // アイテムがあるスロット
            item = document.createElement('div');
            item.className = 'inventory-item';
            item.setAttribute('data-item', activeItems[i].type);

            const iconSpan = document.createElement('span');
            iconSpan.style.fontSize = '24px';
            iconSpan.style.lineHeight = '48px';
            iconSpan.textContent = activeItems[i].icon;

            const countSpan = document.createElement('span');
            countSpan.textContent = activeItems[i].count;

            const itemName = document.createElement('div');
            itemName.className = 'item-name';
            itemName.textContent = activeItems[i].name;

            // アイテムクリックイベントを追加
            item.addEventListener('click', () => {
                // アイテムを素材スロットにセット
                addItemToGrid(activeItems[i].type, activeItems[i].icon);

                // 視覚的なフィードバック
                document.querySelectorAll('#craft-inventory .inventory-item').forEach(el => {
                    el.style.border = '1px solid #9ca3af';
                });
                item.style.border = '2px solid #3b82f6';
            });

            item.appendChild(iconSpan);
            item.appendChild(countSpan);
            item.appendChild(itemName);
        } else {
            // 空のスロット
            item = document.createElement('div');
            item.className = 'empty-slot';
        }

        craftInventory.appendChild(item);
    }

    // デバッグ用: クラフト画面のインベントリ更新をログ
    console.log("クラフト画面インベントリ更新:", {
        activeItems: activeItems.length,
        totalSlots: 9
    });
}

// インベントリからグリッドにアイテムを追加する関数
function addItemToGrid(itemType, icon) {
    // 対応するアイテムの所持数をチェック
    const itemCount = inventoryCounts[itemType];

    // アイテムが1つ以上あるか確認
    if (itemCount <= 0) {
        return;
    }

    // 空いているスロットを探す
    const slots = Array.from(craftGrid.children);
    const emptySlots = slots.filter(slot => !slot.classList.contains('active'));

    if (emptySlots.length > 0) {
        // 空いているスロットの最初のものを使用
        const slot = emptySlots[0];
        const slotIndex = slots.indexOf(slot);

        // スロットにアイテムをセット
        slot.classList.add('active');
        slot.textContent = icon;
        slot.setAttribute('data-item-type', itemType);

        // 選択されたスロットの配列に追加
        if (!selectedSlots.includes(slotIndex)) {
            selectedSlots.push(slotIndex);
        }

        // アイテムカウントを減らす
        inventoryCounts[itemType]--;

        // インベントリ表示を更新
        updateInventory();
        updateCraftInventory();

        // クラフト結果を更新
        updateCraftResult();
    }
}

// クラフト結果を更新する関数
function updateCraftResult() {
    // セットされたアイテムのタイプをチェック
    const slots = Array.from(craftGrid.children);
    const activeSlots = slots.filter(slot => slot.classList.contains('active'));

    // クラフト結果表示をクリア
    craftResult.innerHTML = '';

    // 結果アイコンと個数の要素を作成
    const resultIcon = document.createElement('div');
    resultIcon.className = 'result-icon';

    const resultCount = document.createElement('div');
    resultCount.className = 'result-count';

    // コンテンツリセット
    craftResult.classList.remove('active');
    craftResult.removeAttribute('data-recipe');
    resultIcon.textContent = '？';
    resultCount.textContent = '';

    // アクティブなスロットをチェック
    if (activeSlots.length > 0) {
        // スロットのアイテムタイプを取得
        const itemTypes = activeSlots.map(slot => slot.getAttribute('data-item-type'));

        // レシピ1: 木材1つ → 板材4つ
        if (activeSlots.length === 1 && itemTypes[0] === 'wood') {
            resultIcon.textContent = itemIcons["plank"];
            resultCount.textContent = '×4';
            craftResult.classList.add('active');
            craftResult.setAttribute('data-recipe', 'wood-to-plank');
        }

        // レシピ2: 板材4つ → 作業台1つ
        else if (activeSlots.length === 4 &&
            itemTypes.every(type => type === 'plank')) {
            resultIcon.textContent = itemIcons["workbench"];
            resultCount.textContent = '×1';
            craftResult.classList.add('active');
            craftResult.setAttribute('data-recipe', 'plank-to-workbench');
        }

        // レシピ3: 板材2つ → 棒1つ
        else if (activeSlots.length === 2 &&
            itemTypes.every(type => type === 'plank')) {
            resultIcon.textContent = itemIcons["stick"];
            resultCount.textContent = '×1';
            craftResult.classList.add('active');
            craftResult.setAttribute('data-recipe', 'plank-to-stick');
        }

        // レシピ4: 板材3つ + 棒2つ → 木のツルハシ1つ
        else if (activeSlots.length === 5) {
            const plankCount = itemTypes.filter(type => type === 'plank').length;
            const stickCount = itemTypes.filter(type => type === 'stick').length;

            // ログを出力して状態を確認
            console.log("レシピ4チェック: ", {
                totalSlots: activeSlots.length,
                plankCount: plankCount,
                stickCount: stickCount,
                itemTypes: itemTypes
            });

            if (plankCount === 3 && stickCount === 2) {
                resultIcon.textContent = itemIcons["wooden_pickaxe"];
                resultCount.textContent = '×1';
                craftResult.classList.add('active');
                craftResult.setAttribute('data-recipe', 'wooden-pickaxe');
            }
        }
    }

    // 結果表示に要素を追加
    craftResult.appendChild(resultIcon);
    craftResult.appendChild(resultCount);

    // デバッグ用: クラフト結果の状態をログ
    console.log("クラフト結果更新:", {
        activeSlots: activeSlots.length,
        recipeType: craftResult.getAttribute('data-recipe'),
        isActive: craftResult.classList.contains('active'),
        icon: resultIcon.textContent,
        count: resultCount.textContent
    });
}