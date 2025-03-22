// クラフト機能の変数定義
const craftButton = document.getElementById('craft-button');
const craftScreen = document.getElementById('craft-screen');
const craftGrid = document.getElementById('craft-grid');
const craftResult = document.getElementById('craft-result');
const closeButton = craftScreen.querySelector('.close-button');
const craftArea = document.getElementById('craft-area');
const craftInventoryElement = document.getElementById('craft-inventory');
let selectedSlots = [];
let materialsUsed = false; // クラフト素材が使用済みかどうかのフラグ

// レシピ機能の変数定義
const recipeButton = document.getElementById('recipe-button');
const recipeWindow = document.getElementById('recipe-window');
const recipeList = document.getElementById('recipe-list');
const closeRecipeButton = document.getElementById('close-recipe-button');

// クラフトボタンクリック時の処理
craftButton.addEventListener('click', () => {
    materialsUsed = openCraftingScreen(craftScreen, craftGrid, craftResult, selectedSlots);

    // グリッドのリセット
    resetCraftingGrid(craftGrid);

    // クラフト結果をリセット
    resetCraftingResult(craftResult);

    // インベントリをクラフト画面にコピー
    updateCraftInventory();
});

// 閉じるボタンクリック時の処理
closeButton.addEventListener('click', () => {
    // クラフトグリッドの全スロットをリセット（active と missing の両方）
    Array.from(craftGrid.children).forEach(slot => {
        slot.classList.remove('active', 'missing');
        slot.innerHTML = '';
        slot.removeAttribute('data-item-type');
    });

    materialsUsed = closeCraftingScreen(craftScreen, craftGrid, materialsUsed);
});

// クラフトグリッドのスロットクリック時の処理 (改善版)
craftGrid.addEventListener('click', (event) => {
    // イベントの発生元がどのスロットかを捕捉する
    let target = event.target;
    let slot = null;

    // クリックされた要素かその親要素がcraft-slotクラスを持つ要素かを確認
    while (target && target !== craftGrid) {
        if (target.classList && (target.classList.contains('craft-slot'))) {
            slot = target;
            break;
        }
        target = target.parentElement;
    }

    // スロットが見つかったら処理
    if (slot) {
        console.log("クリックイベント捕捉: スロット検出");
        handleCraftSlotClick(slot, craftGrid, selectedSlots, updateCraftResult, updateCraftInventory);
    } else {
        console.log("クリックイベント捕捉: スロット外の要素がクリックされました", event.target);
    }
});
// クラフト結果クリック時の処理
craftResult.addEventListener('click', () => {
    // 参照渡しのために materialsUsed をオブジェクトでラップ
    const materialsUsedRef = { value: materialsUsed };

    handleCraftResultClick(craftResult, materialsUsedRef, selectedSlots, craftGrid);

    // materialsUsed を更新
    materialsUsed = materialsUsedRef.value;

    // インベントリを更新
    updateCraftInventory();

    // デバッグ用: クラフト完了時のインベントリ状態
    console.log("クラフト完了時のインベントリ状態:", {
        ...inventoryCounts,
        materialsUsed: materialsUsed
    });
});

// クラフト画面用のインベントリを更新する関数
function updateCraftInventory() {
    updateCraftingInventory(craftInventoryElement, addItemToCraftGrid);
}

// インベントリからグリッドにアイテムを追加する関数
function addItemToCraftGrid(itemType, icon) {
    addItemToGrid(itemType, icon, craftGrid, selectedSlots, updateCraftResult);
    updateCraftInventory();
}

// クラフト結果を更新する関数
function updateCraftResult() {
    // セットされたアイテムのタイプをチェック
    const slots = Array.from(craftGrid.children);
    const activeSlots = slots.filter(slot => slot.classList.contains('active'));
    const missingSlots = slots.filter(slot => slot.classList.contains('missing'));
    const totalFilledSlots = activeSlots.length + missingSlots.length;

    // クラフト結果表示をクリア
    craftResult.innerHTML = '';

    // 結果アイコンと個数の要素を作成
    const resultIcon = document.createElement('div');
    resultIcon.className = 'result-icon';

    const resultCount = document.createElement('div');
    resultCount.className = 'result-count';

    // アイテム名ツールチップを作成
    const itemNameTooltip = document.createElement('div');
    itemNameTooltip.className = 'item-name';

    // コンテンツリセット
    craftResult.classList.remove('active');
    craftResult.classList.remove('incomplete');
    craftResult.removeAttribute('data-recipe');
    resultIcon.textContent = '？';
    resultCount.textContent = '';
    itemNameTooltip.textContent = '';

    // 不足している素材がないか確認
    const hasMissingMaterials = missingSlots.length > 0;

    // アイテムタイプを取得
    const activeItemTypes = activeSlots.map(slot => slot.getAttribute('data-item-type'));
    const missingItemTypes = missingSlots.map(slot => slot.getAttribute('data-item-type'));
    const allItemTypes = [...activeItemTypes, ...missingItemTypes];

    // 各アイテムの個数をカウント
    const woodCount = allItemTypes.filter(type => type === 'wood').length;
    const plankCount = allItemTypes.filter(type => type === 'plank').length;
    const stickCount = allItemTypes.filter(type => type === 'stick').length;

    // 結果の表示判定（hasMissingMaterialsがtrueの場合は結果を表示するが'active'クラスは付与しない）
    let resultRecipe = null;
    let currentRecipe = null;

    // レシピ1: 木材1つ → 板材4つ
    if (totalFilledSlots === 1 && woodCount === 1) {
        resultIcon.textContent = itemIcons["plank"];
        resultCount.textContent = '×4';
        resultRecipe = 'wood-to-plank';
        currentRecipe = craftRecipes.basic.find(r => r.id === resultRecipe);
        if (currentRecipe) {
            itemNameTooltip.textContent = currentRecipe.name;
        }
    }
    // レシピ2: 板材4つ → 作業台1つ
    else if (totalFilledSlots === 4 && plankCount === 4) {
        resultIcon.textContent = itemIcons["workbench"];
        resultCount.textContent = '×1';
        resultRecipe = 'plank-to-workbench';
        currentRecipe = craftRecipes.basic.find(r => r.id === resultRecipe);
        if (currentRecipe) {
            itemNameTooltip.textContent = currentRecipe.name;
        }
    }
    // レシピ3: 板材2つ → 棒1つ
    else if (totalFilledSlots === 2 && plankCount === 2) {
        resultIcon.textContent = itemIcons["stick"];
        resultCount.textContent = '×1';
        resultRecipe = 'plank-to-stick';
        currentRecipe = craftRecipes.basic.find(r => r.id === resultRecipe);
        if (currentRecipe) {
            itemNameTooltip.textContent = currentRecipe.name;
        }
    }
    // レシピ4: 板材3つ + 棒2つ → 木のツルハシ1つ
    else if (totalFilledSlots === 5 && plankCount === 3 && stickCount === 2) {
        resultIcon.textContent = itemIcons["wooden_pickaxe"];
        resultCount.textContent = '×1';
        resultRecipe = 'wooden-pickaxe';
        currentRecipe = craftRecipes.basic.find(r => r.id === resultRecipe);
        if (currentRecipe) {
            itemNameTooltip.textContent = currentRecipe.name;
        }
    }

    // レシピが認識された場合
    if (resultRecipe) {
        craftResult.setAttribute('data-recipe', resultRecipe);

        // 素材が不足していなければアクティブにする
        if (!hasMissingMaterials) {
            craftResult.classList.add('active');
        } else {
            // 不足している場合はクラフト不可のスタイルを適用
            craftResult.classList.add('incomplete');
        }
    }

    // 結果表示に要素を追加
    craftResult.appendChild(resultIcon);
    craftResult.appendChild(resultCount);
    craftResult.appendChild(itemNameTooltip);

    // デバッグ用: クラフト結果の状態をログ
    console.log("クラフト結果更新:", {
        activeSlots: activeSlots.length,
        missingSlots: missingSlots.length,
        recipeType: craftResult.getAttribute('data-recipe'),
        isActive: craftResult.classList.contains('active'),
        isIncomplete: craftResult.classList.contains('incomplete'),
        hasMissingMaterials: hasMissingMaterials,
        icon: resultIcon.textContent,
        count: resultCount.textContent,
        name: itemNameTooltip.textContent
    });
}

// レシピボタンのクリックイベント
recipeButton.addEventListener('click', () => {
    // レシピリストを更新して表示
    updateRecipeList(craftRecipes.basic, recipeList, recipeWindow, autoSetCraftRecipeMaterials);
    recipeWindow.style.display = 'block';
});

// レシピウィンドウを閉じるボタン
closeRecipeButton.addEventListener('click', () => {
    recipeWindow.style.display = 'none';
});

// 素材を自動でセットする関数
function autoSetCraftRecipeMaterials(recipe) {
    autoSetRecipeMaterials(recipe, craftGrid, selectedSlots, addItemToCraftGrid, updateCraftResult);
}