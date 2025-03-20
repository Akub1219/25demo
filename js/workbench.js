// 作業台クラフト機能
const workbenchScreen = document.getElementById('workbench-screen');
const workbenchGrid = document.getElementById('workbench-grid');
const workbenchResult = document.getElementById('workbench-result');
const closeWorkbenchButton = workbenchScreen.querySelector('.close-workbench-button');
const workbenchArea = document.getElementById('workbench-area');

let workbenchSelectedSlots = []; // 作業台用の選択スロット配列
let workbenchMaterialsUsed = false; // 作業台用のフラグ

// 作業台レシピ機能の変数定義
const workbenchRecipeButton = document.getElementById('workbench-recipe-button');
const workbenchRecipeWindow = document.getElementById('workbench-recipe-window');
const workbenchRecipeList = document.getElementById('workbench-recipe-list');
const closeWorkbenchRecipeButton = document.getElementById('close-workbench-recipe-button');

// 作業台レシピの定義（通常のクラフトも含む）
const workbenchRecipes = [
    // 通常のクラフトレシピも作業台で利用可能
    {
        id: 'wood-to-plank',
        name: '板材',
        icon: itemIcons['plank'],
        result: { type: 'plank', count: 4 },
        materials: [{ type: 'wood', count: 1 }],
        description: '木材1個から板材4個を作成'
    },
    {
        id: 'plank-to-stick',
        name: '棒',
        icon: itemIcons['stick'],
        result: { type: 'stick', count: 1 },
        materials: [{ type: 'plank', count: 2 }],
        description: '板材2個から棒1個を作成'
    },
    {
        id: 'plank-to-workbench',
        name: '作業台',
        icon: itemIcons['workbench'],
        result: { type: 'workbench', count: 1 },
        materials: [{ type: 'plank', count: 4 }],
        description: '板材4個から作業台1個を作成'
    },
    {
        id: 'wooden-pickaxe',
        name: '木のツルハシ',
        icon: itemIcons['wooden_pickaxe'],
        result: { type: 'wooden_pickaxe', count: 1 },
        materials: [
            { type: 'plank', count: 3 },
            { type: 'stick', count: 2 }
        ],
        description: '板材3個と棒2個から木のツルハシ1個を作成'
    },
    // 作業台専用のレシピ
    {
        id: 'stone-pickaxe',
        name: '石のツルハシ',
        icon: itemIcons['item5'],
        result: { type: 'item5', count: 1 },
        materials: [
            { type: 'rock', count: 3 },
            { type: 'stick', count: 2 }
        ],
        description: '石3個と棒2個から石のツルハシ1個を作成'
    },
    {
        id: 'wooden-sword',
        name: '木の剣',
        icon: itemIcons['item6'],
        result: { type: 'item6', count: 1 },
        materials: [
            { type: 'wood', count: 4 },
            { type: 'stick', count: 2 }
        ],
        description: '木材4個と棒2個から木の剣1個を作成'
    },
    {
        id: 'wooden-shield',
        name: '木の盾',
        icon: itemIcons['item7'],
        result: { type: 'item7', count: 1 },
        materials: [
            { type: 'plank', count: 6 }
        ],
        description: '板材6個から木の盾1個を作成'
    }
];

// 作業台クラフト画面を開く
function openWorkbenchScreen() {
    workbenchScreen.style.display = 'flex';
    workbenchSelectedSlots = [];
    workbenchMaterialsUsed = false;

    // グリッドのリセット
    Array.from(workbenchGrid.children).forEach(slot => {
        slot.classList.remove('active');
        slot.textContent = '';
        slot.removeAttribute('data-item-type');
    });

    // クラフト結果をリセット
    workbenchResult.innerHTML = '';
    const resultIcon = document.createElement('div');
    resultIcon.className = 'result-icon';
    resultIcon.textContent = '？';
    workbenchResult.appendChild(resultIcon);
    workbenchResult.classList.remove('active');
    workbenchResult.removeAttribute('data-recipe');

    // 作業台インベントリを更新
    updateWorkbenchInventory();

    console.log("作業台画面を開きました");
}

// 作業台のインベントリを更新する関数
function updateWorkbenchInventory() {
    const workbenchInventory = document.getElementById('workbench-inventory');
    workbenchInventory.innerHTML = ''; // 既存の内容をクリア

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
                addItemToWorkbenchGrid(activeItems[i].type, activeItems[i].icon);

                // 視覚的なフィードバック
                document.querySelectorAll('#workbench-inventory .inventory-item').forEach(el => {
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

        workbenchInventory.appendChild(item);
    }

    // デバッグ用: 作業台画面のインベントリ更新をログ
    console.log("作業台画面インベントリ更新:", {
        activeItems: activeItems.length,
        totalSlots: 9
    });
}

// インベントリから作業台グリッドにアイテムを追加する関数
function addItemToWorkbenchGrid(itemType, icon) {
    // 対応するアイテムの所持数をチェック
    const itemCount = inventoryCounts[itemType];

    // アイテムが1つ以上あるか確認
    if (itemCount <= 0) {
        return;
    }

    // 空いているスロットを探す
    const slots = Array.from(workbenchGrid.children);
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
        if (!workbenchSelectedSlots.includes(slotIndex)) {
            workbenchSelectedSlots.push(slotIndex);
        }

        // アイテムカウントを減らす
        inventoryCounts[itemType]--;

        // インベントリ表示を更新
        updateInventory();
        updateWorkbenchInventory();

        // 作業台クラフト結果を更新
        updateWorkbenchResult();

        console.log(`アイテム追加: ${itemType} (残り: ${inventoryCounts[itemType]})`);
    }
}

// 作業台の結果を更新する関数
function updateWorkbenchResult() {
    // セットされたアイテムのタイプをチェック
    const slots = Array.from(workbenchGrid.children);
    const activeSlots = slots.filter(slot => slot.classList.contains('active'));

    // クラフト結果表示をクリア
    workbenchResult.innerHTML = '';

    // 結果アイコンと個数の要素を作成
    const resultIcon = document.createElement('div');
    resultIcon.className = 'result-icon';

    const resultCount = document.createElement('div');
    resultCount.className = 'result-count';

    // コンテンツリセット
    workbenchResult.classList.remove('active');
    workbenchResult.removeAttribute('data-recipe');
    resultIcon.textContent = '？';
    resultCount.textContent = '';

    // アクティブなスロット数が0より大きい場合のみ処理
    if (activeSlots.length > 0) {
        // スロットのアイテムタイプを取得
        const itemTypes = activeSlots.map(slot => slot.getAttribute('data-item-type'));

        // 各アイテムの個数をカウント
        const rockCount = itemTypes.filter(type => type === 'rock').length;
        const stickCount = itemTypes.filter(type => type === 'stick').length;
        const woodCount = itemTypes.filter(type => type === 'wood').length;
        const plankCount = itemTypes.filter(type => type === 'plank').length;

        // デバッグログ: セットされたアイテムを確認
        console.log("作業台の現在のアイテム:", {
            activeSlots: activeSlots.length,
            itemTypes: itemTypes,
            rockCount: rockCount,
            stickCount: stickCount,
            woodCount: woodCount,
            plankCount: plankCount
        });

        // 基本のクラフトレシピも作業台で作れるようにする
        // レシピ: 木材1つ → 板材4つ
        if (woodCount === 1 && activeSlots.length === 1) {
            resultIcon.textContent = itemIcons["plank"];
            resultCount.textContent = '×4';
            workbenchResult.classList.add('active');
            workbenchResult.setAttribute('data-recipe', 'wood-to-plank');
            console.log("木材→板材のレシピを認識しました");
        }
        // レシピ: 板材2つ → 棒1つ
        else if (plankCount === 2 && activeSlots.length === 2) {
            resultIcon.textContent = itemIcons["stick"];
            resultCount.textContent = '×1';
            workbenchResult.classList.add('active');
            workbenchResult.setAttribute('data-recipe', 'plank-to-stick');
            console.log("板材→棒のレシピを認識しました");
        }
        // レシピ: 板材4つ → 作業台1つ
        else if (plankCount === 4 && activeSlots.length === 4) {
            resultIcon.textContent = itemIcons["workbench"];
            resultCount.textContent = '×1';
            workbenchResult.classList.add('active');
            workbenchResult.setAttribute('data-recipe', 'plank-to-workbench');
            console.log("板材→作業台のレシピを認識しました");
        }
        // レシピ: 板材3つ + 棒2つ → 木のツルハシ1つ
        else if (plankCount === 3 && stickCount === 2 && activeSlots.length === 5) {
            resultIcon.textContent = itemIcons["wooden_pickaxe"];
            resultCount.textContent = '×1';
            workbenchResult.classList.add('active');
            workbenchResult.setAttribute('data-recipe', 'wooden-pickaxe');
            console.log("木のツルハシのレシピを認識しました");
        }
        // レシピ: 石3つ + 棒2つ → 石のツルハシ1つ
        else if (rockCount === 3 && stickCount === 2 && activeSlots.length === 5) {
            resultIcon.textContent = itemIcons["item5"];
            resultCount.textContent = '×1';
            workbenchResult.classList.add('active');
            workbenchResult.setAttribute('data-recipe', 'stone-pickaxe');
            console.log("石のツルハシのレシピを認識しました");
        }
        // レシピ: 木材4つ + 棒2つ → 木の剣1つ
        else if (woodCount === 4 && stickCount === 2 && activeSlots.length === 6) {
            resultIcon.textContent = itemIcons["item6"];
            resultCount.textContent = '×1';
            workbenchResult.classList.add('active');
            workbenchResult.setAttribute('data-recipe', 'wooden-sword');
            console.log("木の剣のレシピを認識しました");
        }
        // レシピ: 板材6つ → 木の盾1つ
        else if (plankCount === 6 && activeSlots.length === 6) {
            resultIcon.textContent = itemIcons["item7"];
            resultCount.textContent = '×1';
            workbenchResult.classList.add('active');
            workbenchResult.setAttribute('data-recipe', 'wooden-shield');
            console.log("木の盾のレシピを認識しました");
        } else {
            console.log("該当するレシピはありません");
        }
    }

    // 結果表示に要素を追加
    workbenchResult.appendChild(resultIcon);
    workbenchResult.appendChild(resultCount);

    // デバッグ用: 作業台クラフト結果の状態をログ
    console.log("作業台クラフト結果更新:", {
        activeSlots: activeSlots.length,
        recipeType: workbenchResult.getAttribute('data-recipe'),
        isActive: workbenchResult.classList.contains('active'),
        icon: resultIcon.textContent,
        count: resultCount.textContent
    });
}

// 作業台クラフト結果のクリックイベント
workbenchResult.addEventListener('click', () => {
    if (workbenchResult.classList.contains('active')) {
        const recipe = workbenchResult.getAttribute('data-recipe');
        console.log(`レシピクリック: ${recipe}`);

        if (recipe === 'wood-to-plank') {
            // 木材1つを消費して板材4つを作成
            inventoryCounts.plank += 4;
            alert('板材4個をクラフトしました！');
        } else if (recipe === 'plank-to-stick') {
            // 板材2つを消費して棒1つを作成
            inventoryCounts.stick += 1;
            alert('棒をクラフトしました！');
        } else if (recipe === 'plank-to-workbench') {
            // 板材4つを消費して作業台1つを作成
            inventoryCounts.workbench += 1;
            alert('作業台をクラフトしました！');
        } else if (recipe === 'wooden-pickaxe') {
            // 板材3つと棒2つを消費して木のツルハシ1つを作成
            inventoryCounts.wooden_pickaxe += 1;
            alert('木のツルハシをクラフトしました！');
        } else if (recipe === 'stone-pickaxe') {
            // 石3つと棒2つを消費して石のツルハシ1つを作成
            inventoryCounts.item5 += 1;
            // アイテム名のセット
            itemNames["item5"] = "石のツルハシ";
            alert('石のツルハシをクラフトしました！');
        } else if (recipe === 'wooden-sword') {
            // 木材4つと棒2つを消費して木の剣1つを作成
            inventoryCounts.item6 += 1;
            // アイテム名のセット
            itemNames["item6"] = "木の剣";
            alert('木の剣をクラフトしました！');
        } else if (recipe === 'wooden-shield') {
            // 板材6つを消費して木の盾1つを作成
            inventoryCounts.item7 += 1;
            // アイテム名のセット
            itemNames["item7"] = "木の盾";
            alert('木の盾をクラフトしました！');
        }

        // 素材使用済みとマーク
        workbenchMaterialsUsed = true;

        // クラフトグリッドをリセット
        workbenchSelectedSlots = [];
        Array.from(workbenchGrid.children).forEach(slot => {
            slot.classList.remove('active');
            slot.textContent = '';
            slot.removeAttribute('data-item-type');
        });

        // クラフト結果をリセット
        workbenchResult.innerHTML = '';
        const resultIcon = document.createElement('div');
        resultIcon.className = 'result-icon';
        resultIcon.textContent = '？';
        workbenchResult.appendChild(resultIcon);
        workbenchResult.classList.remove('active');
        workbenchResult.removeAttribute('data-recipe');

        // インベントリを更新
        updateInventory();
        updateWorkbenchInventory();

        // デバッグ用: クラフト完了時のインベントリ状態
        console.log("作業台クラフト完了時のインベントリ状態:", {
            ...inventoryCounts,
            workbenchMaterialsUsed: workbenchMaterialsUsed
        });
    }
});
// 作業台クラフト結果のクリックイベント
workbenchResult.addEventListener('click', () => {
    if (workbenchResult.classList.contains('active')) {
        const recipe = workbenchResult.getAttribute('data-recipe');
        console.log(`レシピクリック: ${recipe}`);

        if (recipe === 'stone-pickaxe') {
            // 石3つと棒2つを消費して石のツルハシ1つを作成
            inventoryCounts.item5 += 1;
            // アイテム名のセット
            itemNames["item5"] = "石のツルハシ";
            alert('石のツルハシをクラフトしました！');
        } else if (recipe === 'wooden-sword') {
            // 木材4つと棒2つを消費して木の剣1つを作成
            inventoryCounts.item6 += 1;
            // アイテム名のセット
            itemNames["item6"] = "木の剣";
            alert('木の剣をクラフトしました！');
        } else if (recipe === 'wooden-shield') {
            // 板材6つを消費して木の盾1つを作成
            inventoryCounts.item7 += 1;
            // アイテム名のセット
            itemNames["item7"] = "木の盾";
            alert('木の盾をクラフトしました！');
        }

        // 素材使用済みとマーク
        workbenchMaterialsUsed = true;

        // クラフトグリッドをリセット
        workbenchSelectedSlots = [];
        Array.from(workbenchGrid.children).forEach(slot => {
            slot.classList.remove('active');
            slot.textContent = '';
            slot.removeAttribute('data-item-type');
        });

        // クラフト結果をリセット
        workbenchResult.innerHTML = '';
        const resultIcon = document.createElement('div');
        resultIcon.className = 'result-icon';
        resultIcon.textContent = '？';
        workbenchResult.appendChild(resultIcon);
        workbenchResult.classList.remove('active');
        workbenchResult.removeAttribute('data-recipe');

        // インベントリを更新
        updateInventory();
        updateWorkbenchInventory();

        // デバッグ用: クラフト完了時のインベントリ状態
        console.log("作業台クラフト完了時のインベントリ状態:", {
            ...inventoryCounts,
            workbenchMaterialsUsed: workbenchMaterialsUsed
        });
    }
});

// 作業台を閉じるボタンのイベント
closeWorkbenchButton.addEventListener('click', () => {
    // 作業台を閉じる前に、スロットに配置された素材をインベントリに戻す
    // ただし、素材が使用済みの場合は戻さない
    if (!workbenchMaterialsUsed) {
        Array.from(workbenchGrid.children).forEach(slot => {
            if (slot.classList.contains('active')) {
                const itemType = slot.getAttribute('data-item-type');

                // アイテムをインベントリに戻す（クラフトをキャンセルした場合）
                if (itemType) {
                    inventoryCounts[itemType]++;
                    console.log(`作業台を閉じる: ${itemType}をインベントリに戻します`);
                }

                // スロットをリセット
                slot.classList.remove('active');
                slot.textContent = '';
                slot.removeAttribute('data-item-type');
            }
        });
    }

    workbenchScreen.style.display = 'none';

    // マップ画面のインベントリを更新
    updateInventory();

    // デバッグ用: 現在のインベントリ状態をログに出力
    console.log("作業台を閉じる時のインベントリ状態:", {
        ...inventoryCounts,
        workbenchMaterialsUsed: workbenchMaterialsUsed
    });

    // 素材使用フラグをリセット（次回クラフト用）
    workbenchMaterialsUsed = false;
});

// 作業台レシピボタンのクリックイベント
workbenchRecipeButton.addEventListener('click', () => {
    // レシピリストを更新して表示
    updateWorkbenchRecipeList();
    workbenchRecipeWindow.style.display = 'block';
});

// 作業台レシピウィンドウを閉じるボタン
closeWorkbenchRecipeButton.addEventListener('click', () => {
    workbenchRecipeWindow.style.display = 'none';
});

// 作業台レシピリストを更新する関数
function updateWorkbenchRecipeList() {
    // レシピリストをクリア
    workbenchRecipeList.innerHTML = '';

    // レシピの可用性をチェックして、作成可能なものを先に表示
    const sortedRecipes = [...workbenchRecipes].sort((a, b) => {
        const canCraftA = canCraftWorkbenchRecipe(a);
        const canCraftB = canCraftWorkbenchRecipe(b);

        if (canCraftA && !canCraftB) return -1;
        if (!canCraftA && canCraftB) return 1;
        return 0;
    });

    // レシピをリストに追加
    sortedRecipes.forEach(recipe => {
        const canCraft = canCraftWorkbenchRecipe(recipe);

        // レシピアイテム要素の作成
        const recipeItem = document.createElement('div');
        recipeItem.className = `recipe-item ${canCraft ? 'available' : 'unavailable'}`;
        recipeItem.setAttribute('data-recipe-id', recipe.id);

        // アイコン
        const iconElement = document.createElement('div');
        iconElement.className = 'recipe-item-icon';
        iconElement.textContent = recipe.icon;

        // 個数
        const countElement = document.createElement('div');
        countElement.className = 'recipe-item-count';
        countElement.textContent = `×${recipe.result.count}`;

        // アイテム名
        const nameElement = document.createElement('div');
        nameElement.className = 'recipe-item-name';
        nameElement.textContent = recipe.name;

        // レシピアイテムにクリックイベントを追加（作成可能な場合のみ）
        if (canCraft) {
            recipeItem.addEventListener('click', () => {
                // レシピウィンドウを閉じる
                workbenchRecipeWindow.style.display = 'none';

                // 素材を自動でセット
                autoSetWorkbenchRecipeMaterials(recipe);
            });
        }

        // 要素を追加
        recipeItem.appendChild(iconElement);
        recipeItem.appendChild(countElement);
        recipeItem.appendChild(nameElement);
        workbenchRecipeList.appendChild(recipeItem);
    });
}

// 作業台レシピが作成可能かチェックする関数
function canCraftWorkbenchRecipe(recipe) {
    return recipe.materials.every(material => {
        return inventoryCounts[material.type] >= material.count;
    });
}

// 作業台に素材を自動でセットする関数
function autoSetWorkbenchRecipeMaterials(recipe) {
    // まず現在の素材をインベントリに戻す
    Array.from(workbenchGrid.children).forEach(slot => {
        if (slot.classList.contains('active')) {
            const itemType = slot.getAttribute('data-item-type');
            if (itemType) {
                inventoryCounts[itemType]++;
            }
            slot.classList.remove('active');
            slot.textContent = '';
            slot.removeAttribute('data-item-type');
        }
    });

    // 選択スロットをリセット
    workbenchSelectedSlots = [];

    // 素材を順番にセット
    recipe.materials.forEach(material => {
        for (let i = 0; i < material.count; i++) {
            // インベントリから素材を追加
            addItemToWorkbenchGrid(material.type, itemIcons[material.type]);
        }
    });

    // インベントリと結果を更新
    updateInventory();
    updateWorkbenchInventory();
    updateWorkbenchResult();
}