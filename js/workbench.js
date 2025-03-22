// 作業台クラフト機能
const workbenchScreen = document.getElementById('workbench-screen');
const workbenchGrid = document.getElementById('workbench-grid');
const workbenchResult = document.getElementById('workbench-result');
const closeWorkbenchButton = workbenchScreen.querySelector('.close-workbench-button');
const workbenchArea = document.getElementById('workbench-area');
const workbenchInventoryElement = document.getElementById('workbench-inventory');

let workbenchSelectedSlots = []; // 作業台用の選択スロット配列
let workbenchMaterialsUsed = false; // 作業台用のフラグ

// 作業台レシピ機能の変数定義
const workbenchRecipeButton = document.getElementById('workbench-recipe-button');
const workbenchRecipeWindow = document.getElementById('workbench-recipe-window');
const workbenchRecipeList = document.getElementById('workbench-recipe-list');
const closeWorkbenchRecipeButton = document.getElementById('close-workbench-recipe-button');

// 作業台クラフト画面を開く
function openWorkbenchScreen() {
    workbenchMaterialsUsed = openCraftingScreen(workbenchScreen, workbenchGrid, workbenchResult, workbenchSelectedSlots);

    // グリッドのリセット
    resetCraftingGrid(workbenchGrid);

    // クラフト結果をリセット
    resetCraftingResult(workbenchResult);

    // 作業台インベントリを更新
    updateWorkbenchInventory();

    console.log("作業台画面を開きました");
}

// 作業台のインベントリを更新する関数
function updateWorkbenchInventory() {
    updateCraftingInventory(workbenchInventoryElement, addItemToWorkbenchGrid);
}

// インベントリから作業台グリッドにアイテムを追加する関数
function addItemToWorkbenchGrid(itemType, icon) {
    addItemToGrid(itemType, icon, workbenchGrid, workbenchSelectedSlots, updateWorkbenchResult);
    updateWorkbenchInventory();
}

// 作業台の結果を更新する関数
function updateWorkbenchResult() {
    // セットされたアイテムのタイプをチェック
    const slots = Array.from(workbenchGrid.children);
    const activeSlots = slots.filter(slot => slot.classList.contains('active'));
    const missingSlots = slots.filter(slot => slot.classList.contains('missing'));
    const totalFilledSlots = activeSlots.length + missingSlots.length;

    // クラフト結果表示をクリア
    workbenchResult.innerHTML = '';

    // 結果アイコンと個数の要素を作成
    const resultIcon = document.createElement('div');
    resultIcon.className = 'result-icon';

    const resultCount = document.createElement('div');
    resultCount.className = 'result-count';

    // コンテンツリセット
    workbenchResult.classList.remove('incomplete');
    workbenchResult.removeAttribute('data-recipe');
    resultIcon.textContent = '？';
    resultCount.textContent = '';

    // 不足している素材がないか確認
    const hasMissingMaterials = missingSlots.length > 0;

    // アイテムタイプを取得
    const activeItemTypes = activeSlots.map(slot => slot.getAttribute('data-item-type'));
    const missingItemTypes = missingSlots.map(slot => slot.getAttribute('data-item-type'));
    const allItemTypes = [...activeItemTypes, ...missingItemTypes];

    // 各アイテムの個数をカウント
    const rockCount = allItemTypes.filter(type => type === 'rock').length;
    const stickCount = allItemTypes.filter(type => type === 'stick').length;
    const woodCount = allItemTypes.filter(type => type === 'wood').length;
    const plankCount = allItemTypes.filter(type => type === 'plank').length;

    // デバッグログ: セットされたアイテムを確認
    console.log("作業台の現在のアイテム:", {
        activeSlots: activeSlots.length,
        missingSlots: missingSlots.length,
        itemTypes: allItemTypes,
        rockCount: rockCount,
        stickCount: stickCount,
        woodCount: woodCount,
        plankCount: plankCount
    });

    // 結果の表示判定
    let resultRecipe = null;

    // 基本のクラフトレシピも作業台で作れるようにする
    // レシピ: 木材1つ → 板材4つ
    if (totalFilledSlots === 1 && woodCount === 1) {
        resultIcon.textContent = itemIcons["plank"];
        resultCount.textContent = '×4';
        resultRecipe = 'wood-to-plank';
        console.log("木材→板材のレシピを認識しました");
    }
    // レシピ: 板材2つ → 棒1つ
    else if (totalFilledSlots === 2 && plankCount === 2) {
        resultIcon.textContent = itemIcons["stick"];
        resultCount.textContent = '×1';
        resultRecipe = 'plank-to-stick';
        console.log("板材→棒のレシピを認識しました");
    }
    // レシピ: 板材4つ → 作業台1つ
    else if (totalFilledSlots === 4 && plankCount === 4) {
        resultIcon.textContent = itemIcons["workbench"];
        resultCount.textContent = '×1';
        resultRecipe = 'plank-to-workbench';
        console.log("板材→作業台のレシピを認識しました");
    }
    // レシピ: 板材3つ + 棒2つ → 木のツルハシ1つ
    else if (totalFilledSlots === 5 && plankCount === 3 && stickCount === 2) {
        resultIcon.textContent = itemIcons["wooden_pickaxe"];
        resultCount.textContent = '×1';
        resultRecipe = 'wooden-pickaxe';
        console.log("木のツルハシのレシピを認識しました");
    }
    // レシピ: 石3つ + 棒2つ → 石のツルハシ1つ
    else if (totalFilledSlots === 5 && rockCount === 3 && stickCount === 2) {
        resultIcon.textContent = itemIcons["item5"];
        resultCount.textContent = '×1';
        resultRecipe = 'stone-pickaxe';
        console.log("石のツルハシのレシピを認識しました");
    }
    // レシピ: 木材4つ + 棒2つ → 木の剣1つ
    else if (totalFilledSlots === 6 && woodCount === 4 && stickCount === 2) {
        resultIcon.textContent = itemIcons["item6"];
        resultCount.textContent = '×1';
        resultRecipe = 'wooden-sword';
        console.log("木の剣のレシピを認識しました");
    }
    // レシピ: 板材6つ → 木の盾1つ
    else if (totalFilledSlots === 6 && plankCount === 6) {
        resultIcon.textContent = itemIcons["item7"];
        resultCount.textContent = '×1';
        resultRecipe = 'wooden-shield';
        console.log("木の盾のレシピを認識しました");
    } else {
        console.log("該当するレシピはありません");
    }

    // レシピが認識された場合
    if (resultRecipe) {
        workbenchResult.setAttribute('data-recipe', resultRecipe);

        // 素材が不足していなければアクティブにする
        if (!hasMissingMaterials) {
            workbenchResult.classList.add('active');
        } else {
            // 不足している場合はクラフト不可のスタイルを適用
            workbenchResult.classList.add('incomplete');
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
    // 参照渡しのために workbenchMaterialsUsed をオブジェクトでラップ
    const materialsUsedRef = { value: workbenchMaterialsUsed };

    handleCraftResultClick(workbenchResult, materialsUsedRef, workbenchSelectedSlots, workbenchGrid);

    // workbenchMaterialsUsed を更新
    workbenchMaterialsUsed = materialsUsedRef.value;

    // インベントリを更新
    updateWorkbenchInventory();

    // デバッグ用: クラフト完了時のインベントリ状態
    console.log("作業台クラフト完了時のインベントリ状態:", {
        ...inventoryCounts,
        workbenchMaterialsUsed: workbenchMaterialsUsed
    });
});

// 作業台を閉じるボタンのイベント
closeWorkbenchButton.addEventListener('click', () => {
    workbenchMaterialsUsed = closeCraftingScreen(workbenchScreen, workbenchGrid, workbenchMaterialsUsed);
});

// 作業台レシピボタンのクリックイベント
workbenchRecipeButton.addEventListener('click', () => {
    // レシピリストを更新して表示
    const allRecipes = [...craftRecipes.basic, ...craftRecipes.advanced];
    updateRecipeList(allRecipes, workbenchRecipeList, workbenchRecipeWindow, autoSetWorkbenchRecipeMaterials);
    workbenchRecipeWindow.style.display = 'block';
});

// 作業台レシピウィンドウを閉じるボタン
closeWorkbenchRecipeButton.addEventListener('click', () => {
    workbenchRecipeWindow.style.display = 'none';
});

// 作業台に素材を自動でセットする関数
function autoSetWorkbenchRecipeMaterials(recipe) {
    autoSetRecipeMaterials(recipe, workbenchGrid, workbenchSelectedSlots, addItemToWorkbenchGrid, updateWorkbenchResult);
}