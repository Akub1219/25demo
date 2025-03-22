// クラフト機能の共通関数・変数

// クラフトレシピの定義（通常のクラフトと作業台で共通）
const craftRecipes = {
    // 基本レシピ（通常クラフト用）
    basic: [{
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
        }
    ],

    // 作業台専用レシピ
    advanced: [{
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
    ],

    // レシピハンドラー（レシピIDと処理の対応）
    handlers: {
        'wood-to-plank': () => {
            inventoryCounts.plank += 4;
            alert('板材4個をクラフトしました！');
        },
        'plank-to-stick': () => {
            inventoryCounts.stick += 1;
            alert('棒をクラフトしました！');
        },
        'plank-to-workbench': () => {
            inventoryCounts.workbench += 1;
            alert('作業台をクラフトしました！');
        },
        'wooden-pickaxe': () => {
            inventoryCounts.wooden_pickaxe += 1;
            alert('木のツルハシをクラフトしました！');
        },
        'stone-pickaxe': () => {
            inventoryCounts.item5 += 1;
            itemNames["item5"] = "石のツルハシ";
            alert('石のツルハシをクラフトしました！');
        },
        'wooden-sword': () => {
            inventoryCounts.item6 += 1;
            itemNames["item6"] = "木の剣";
            alert('木の剣をクラフトしました！');
        },
        'wooden-shield': () => {
            inventoryCounts.item7 += 1;
            itemNames["item7"] = "木の盾";
            alert('木の盾をクラフトしました！');
        }
    }
};

// クラフトスロットのクリック処理を行う共通関数
function handleCraftSlotClick(slot, gridElement, selectedSlotsArray, updateResultFunc, updateInventoryFunc) {
    // クリックされたスロットのインデックスを取得
    const index = Array.from(gridElement.children).indexOf(slot);

    // デバッグ: クリックされた要素の情報を出力
    console.log("クリックされた要素:", {
        element: slot,
        isActive: slot.classList.contains('active'),
        isMissing: slot.classList.contains('missing'),
        itemType: slot.getAttribute('data-item-type'),
        index: index,
        inSelectedSlots: selectedSlotsArray.includes(index)
    });

    // アクティブまたはmissingスロットが対象
    if (slot.classList.contains('active') || slot.classList.contains('missing')) {
        // 選択スロット配列にあれば解除する
        const slotIndex = selectedSlotsArray.indexOf(index);
        if (slotIndex !== -1) {
            selectedSlotsArray.splice(slotIndex, 1);
        }

        // 戻すアイテムのタイプを取得
        const itemType = slot.getAttribute('data-item-type');

        // 不足分（missing クラス）でない場合のみインベントリに戻す
        if (itemType && !slot.classList.contains('missing')) {
            inventoryCounts[itemType]++;
        }

        // スロットをリセット
        slot.classList.remove('active');
        slot.classList.remove('missing');
        slot.innerHTML = '';
        slot.removeAttribute('data-item-type');

        // インベントリとクラフト結果を更新
        updateInventory();
        if (updateInventoryFunc) updateInventoryFunc();
        updateResultFunc();

        // デバッグログ
        console.log("スロット解除完了:", {
            index: index,
            selectedSlotsRemaining: selectedSlotsArray
        });

        return true; // 処理を行った
    }

    return false; // 処理を行わなかった
}
// クラフト画面を開く共通関数
function openCraftingScreen(screenElement, gridElement, resultElement, selectedSlotsArray) {
    screenElement.style.display = 'flex';
    // 選択スロットをリセット
    selectedSlotsArray.length = 0;
    // 素材使用フラグをリセット
    return false; // materialsUsed の初期値
}

// グリッドをリセットする共通関数
function resetCraftingGrid(gridElement) {
    Array.from(gridElement.children).forEach(slot => {
        slot.classList.remove('active');
        slot.textContent = ''; // アイテム表示を消去
        slot.removeAttribute('data-item-type');
    });
}

// クラフト結果をリセットする共通関数
function resetCraftingResult(resultElement) {
    resultElement.innerHTML = '';
    const resultIcon = document.createElement('div');
    resultIcon.className = 'result-icon';
    resultIcon.textContent = '？';
    resultElement.appendChild(resultIcon);
    resultElement.classList.remove('active');
    resultElement.classList.remove('incomplete');
    resultElement.removeAttribute('data-recipe');
}

// クラフト画面を閉じる共通関数
function closeCraftingScreen(screenElement, gridElement, materialsUsed) {
    // 使用済みでない場合、素材をインベントリに戻す
    if (!materialsUsed) {
        Array.from(gridElement.children).forEach(slot => {
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

            // 追加：未所持の素材スロット（赤いマス）もリセット
            if (slot.classList.contains('missing')) {
                slot.classList.remove('missing');
                slot.textContent = '';
                slot.innerHTML = '';
                slot.removeAttribute('data-item-type');
            }
        });
    }

    screenElement.style.display = 'none';
    // マップ画面のインベントリを更新
    updateInventory();

    // デバッグ用: 現在のインベントリ状態をログに出力
    console.log("閉じる時のインベントリ状態:", {
        ...inventoryCounts,
        materialsUsed: materialsUsed
    });

    return false; // 素材使用フラグをリセット（次回クラフト用）
}
// インベントリからグリッドにアイテムを追加する共通関数
function addItemToGrid(itemType, icon, gridElement, selectedSlotsArray, updateResultFunc) {
    // 対応するアイテムの所持数をチェック
    const itemCount = inventoryCounts[itemType];

    // アイテムが1つ以上あるか確認
    if (itemCount <= 0) {
        return;
    }

    // 空いているスロットを探す
    const slots = Array.from(gridElement.children);
    const emptySlots = slots.filter(slot => !slot.classList.contains('active'));

    if (emptySlots.length > 0) {
        // 空いているスロットの最初のものを使用
        const slot = emptySlots[0];
        const slotIndex = slots.indexOf(slot);

        // スロットにアイテムをセット
        slot.classList.add('active');

        // 中身をクリア
        slot.innerHTML = '';

        // アイコンをセット
        const iconElement = document.createTextNode(icon);
        slot.appendChild(iconElement);

        // アイテム名ツールチップを追加
        const itemNameTooltip = document.createElement('div');
        itemNameTooltip.className = 'item-name';
        itemNameTooltip.textContent = itemNames[itemType] || itemType;
        slot.appendChild(itemNameTooltip);

        slot.setAttribute('data-item-type', itemType);

        // 選択されたスロットの配列に追加
        if (!selectedSlotsArray.includes(slotIndex)) {
            selectedSlotsArray.push(slotIndex);
        }

        // アイテムカウントを減らす
        inventoryCounts[itemType]--;

        // インベントリ表示を更新
        updateInventory();

        // 結果を更新
        updateResultFunc();
    }
}

// クラフト画面用のインベントリを更新する共通関数
function updateCraftingInventory(inventoryElement, addItemFunc) {
    // スタイルを強制的に適用（水平方向のフレックスボックス）
    inventoryElement.style.display = 'flex';
    inventoryElement.style.flexWrap = 'nowrap';
    inventoryElement.style.flexDirection = 'row';
    inventoryElement.style.overflowX = 'auto';

    inventoryElement.innerHTML = ''; // 既存の内容をクリア

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

    // 横に一行でアイテムを表示するためのコンテナを作成
    const itemsContainer = document.createElement('div');
    itemsContainer.style.display = 'flex';
    itemsContainer.style.flexDirection = 'row';
    itemsContainer.style.flexWrap = 'nowrap';
    itemsContainer.style.gap = '10px';
    itemsContainer.style.width = '100%';

    // 9個のスロットを作成（アイテムがあるものとないもの）
    for (let i = 0; i < 9; i++) {
        let item;

        if (i < activeItems.length) {
            // アイテムがあるスロット
            item = document.createElement('div');
            item.className = 'inventory-item';
            item.setAttribute('data-item', activeItems[i].type);
            item.style.flexShrink = '0'; // 横幅を維持

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
                addItemFunc(activeItems[i].type, activeItems[i].icon);
            });

            item.appendChild(iconSpan);
            item.appendChild(countSpan);
            item.appendChild(itemName);
        } else {
            // 空のスロット
            item = document.createElement('div');
            item.className = 'empty-slot';
            item.style.flexShrink = '0'; // 横幅を維持
        }

        itemsContainer.appendChild(item);
    }

    // コンテナをインベントリに追加
    inventoryElement.appendChild(itemsContainer);

    // デバッグ用: クラフト画面のインベントリ更新をログ
    console.log(`${inventoryElement.id} インベントリ更新:`, {
        activeItems: activeItems.length,
        totalSlots: 9,
        layout: 'horizontal row'
    });
}
// レシピが作成可能かチェックする共通関数
function canCraftRecipe(recipe) {
    return recipe.materials.every(material => {
        return inventoryCounts[material.type] >= material.count;
    });
}

// レシピリストを更新する共通関数
function updateRecipeList(recipes, recipeListElement, recipeWindowElement, autoSetMaterialsFunc) {
    // レシピリストをクリア
    recipeListElement.innerHTML = '';

    // レシピの可用性をチェックして、作成可能なものを先に表示
    const sortedRecipes = [...recipes].sort((a, b) => {
        const canCraftA = canCraftRecipe(a);
        const canCraftB = canCraftRecipe(b);

        if (canCraftA && !canCraftB) return -1;
        if (!canCraftA && canCraftB) return 1;
        return 0;
    });

    // レシピをリストに追加
    sortedRecipes.forEach(recipe => {
        const canCraft = canCraftRecipe(recipe);

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

        // すべてのレシピアイテムにクリックイベントを追加（可能・不可能に関わらず）
        recipeItem.addEventListener('click', () => {
            // レシピウィンドウを閉じる
            recipeWindowElement.style.display = 'none';

            // 素材を自動でセット（不足分も含めて）
            autoSetMaterialsFunc(recipe);
        });

        // 要素を追加
        recipeItem.appendChild(iconElement);
        recipeItem.appendChild(countElement);
        recipeItem.appendChild(nameElement);
        recipeListElement.appendChild(recipeItem);
    });
}

// 素材を自動でセットする共通関数
function autoSetRecipeMaterials(recipe, gridElement, selectedSlotsArray, addItemFunc, updateResultFunc) {
    // まず現在の素材をインベントリに戻す
    Array.from(gridElement.children).forEach(slot => {
        if (slot.classList.contains('active') || slot.classList.contains('missing')) {
            const itemType = slot.getAttribute('data-item-type');
            // 不足分の素材はインベントリに戻さない
            if (itemType && !slot.classList.contains('missing')) {
                inventoryCounts[itemType]++;
            }
            slot.classList.remove('active');
            slot.classList.remove('missing');
            slot.textContent = '';
            slot.removeAttribute('data-item-type');
        }
    });

    // 選択スロットをリセット
    selectedSlotsArray.length = 0;

    // 素材アイテムの必要数とインベントリの所持数を計算
    const materialNeeds = {};
    recipe.materials.forEach(material => {
        if (!materialNeeds[material.type]) {
            materialNeeds[material.type] = 0;
        }
        materialNeeds[material.type] += material.count;
    });

    // 各素材の所持数と必要数をログに出力
    console.log("レシピ素材所持状況:", Object.keys(materialNeeds).map(type => ({
        type,
        needed: materialNeeds[type],
        available: inventoryCounts[type]
    })));

    // スロット数チェック
    const totalMaterialsCount = recipe.materials.reduce((sum, material) => sum + material.count, 0);
    const availableSlots = gridElement.children.length;

    if (totalMaterialsCount > availableSlots) {
        // スロット数が不足している場合は警告を表示
        alert(`この${recipe.name}レシピには${totalMaterialsCount}個の素材が必要ですが、このクラフト画面には${availableSlots}個のスロットしかありません。作業台で作成してください。`);
        return;
    }

    // 素材を順番にセット
    let slotsUsed = 0;
    recipe.materials.forEach(material => {
        let available = inventoryCounts[material.type];
        for (let i = 0; i < material.count; i++) {
            if (slotsUsed >= availableSlots) {
                console.warn("利用可能なスロットを超えました");
                break;
            }

            if (available > 0) {
                // 所持している素材をセット
                addItemFunc(material.type, itemIcons[material.type]);
                available--;
            } else {
                // 不足している素材を表示（赤背景）
                const slots = Array.from(gridElement.children);
                const emptySlots = slots.filter(slot => !slot.classList.contains('active') && !slot.classList.contains('missing'));

                if (emptySlots.length > 0) {
                    const slot = emptySlots[0];
                    const slotIndex = slots.indexOf(slot);

                    // スロット内容をクリア
                    slot.innerHTML = '';

                    // 不足分は赤背景で表示
                    slot.classList.add('missing');

                    // アイコンをセット
                    const iconText = document.createTextNode(itemIcons[material.type]);
                    slot.appendChild(iconText);

                    // アイテム名ツールチップを追加（不足素材用のデータ属性を追加）
                    const itemNameTooltip = document.createElement('div');
                    itemNameTooltip.className = 'item-name';
                    itemNameTooltip.textContent = itemNames[material.type] || material.type;
                    itemNameTooltip.setAttribute('data-missing', 'true'); // 不足素材であることを示す属性を追加
                    slot.appendChild(itemNameTooltip);

                    slot.setAttribute('data-item-type', material.type);

                    // 選択スロット配列には追加しない
                    slotsUsed++;
                }
            }
        }
    });

    // インベントリと結果を更新
    updateInventory();
    updateResultFunc();
}

// クラフト結果のクリック処理（共通部分）
function handleCraftResultClick(resultElement, materialsUsedRef, selectedSlotsArray, gridElement) {
    // 'active'クラスがある場合のみクラフト可能
    if (resultElement.classList.contains('active')) {
        const recipeId = resultElement.getAttribute('data-recipe');

        // 対応するレシピハンドラを実行
        const handler = craftRecipes.handlers[recipeId];
        if (handler) {
            handler();
        }

        // 素材使用済みとマーク
        materialsUsedRef.value = true;

        // クラフトグリッドをリセット
        selectedSlotsArray.length = 0;
        Array.from(gridElement.children).forEach(slot => {
            slot.classList.remove('active');
            slot.classList.remove('missing');
            slot.textContent = '';
            slot.removeAttribute('data-item-type');
        });

        // クラフト結果をリセット
        resetCraftingResult(resultElement);

        // インベントリを更新
        updateInventory();
    }
    // 'incomplete'クラスがある場合は素材不足のメッセージを表示
    else if (resultElement.classList.contains('incomplete')) {
        alert('素材が不足しているため、クラフトできません！');
    }
}

// クラフト結果の更新共通関数（レシピ情報からアイテム名を表示するため）
function updateCraftResultWithTooltip(resultElement, recipe) {
    // 結果表示をクリア
    resultElement.innerHTML = '';

    // 結果アイコンと個数を作成
    const resultIcon = document.createElement('div');
    resultIcon.className = 'result-icon';

    const resultCount = document.createElement('div');
    resultCount.className = 'result-count';

    // アイテム名のツールチップを作成
    const itemNameTooltip = document.createElement('div');
    itemNameTooltip.className = 'item-name';

    if (recipe) {
        resultIcon.textContent = recipe.icon;
        resultCount.textContent = `×${recipe.result.count}`;
        itemNameTooltip.textContent = recipe.name;
    } else {
        resultIcon.textContent = '？';
        resultCount.textContent = '';
    }

    // 要素を追加
    resultElement.appendChild(resultIcon);
    resultElement.appendChild(resultCount);
    resultElement.appendChild(itemNameTooltip);
}