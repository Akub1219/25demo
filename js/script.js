// 東京・青山一丁目の座標
const aoyamaItchome = [35.672714, 139.725697];
// マップの初期設定
const map = L.map('map').setView(aoyamaItchome, 16); // 16はズームレベル
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
// キャラクターの初期位置
let characterPosition = aoyamaItchome;
let characterMarker = L.marker(characterPosition, { // マーカーを直接作成
    icon: L.divIcon({
        className: 'character-icon',
        html: '👦',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    })
}).addTo(map);
// 公園の位置情報
const parkLocations = [
    [35.66949011813233, 139.72463906746046, "青山公園", "wood"],
    [35.671154865070015, 139.724778542328, "青葉公園", "wood"],
    [35.6727740590257, 139.72098271529347, "神宮外苑", "wood"],
    [35.673971330419604, 139.72888520021084, "高橋是清翁記念公園", "rock"],
    [35.66712306836001, 139.73243426969967, "檜町公園", "rock"],
];
// 木のアイコンを保持する配列
let treeMarkers = [];
let plankMarkers = [];
let rockMarkers = [];
// インベントリアイテムカウント（全てのアイテムを一つの配列で管理）
let inventoryCounts = {
    "wood": 0,
    "plank": 0,
    "stick": 0,
    "workbench": 0,
    "wooden_pickaxe": 0,
    "rock": 0,
    "item5": 0,
    "item6": 0,
    "item7": 0
};

// アイテムとアイコンの対応
const itemIcons = {
    "wood": "🪵",
    "plank": "🧱",
    "stick": "🪄",
    "workbench": "🕋",
    "wooden_pickaxe": "⛏️",
    "rock": "🪨",
    "item5": "⚒️",
    "item6": "🔨",
    "item7": "🗡️",
    "item8": "🏹"
};

// アイテム名（日本語）
const itemNames = {
    "wood": "原木",
    "plank": "板材",
    "stick": "棒",
    "workbench": "作業台",
    "wooden_pickaxe": "木のツルハシ",
    "rock": "石",
    "item5": "",
    "item6": "",
    "item7": ""
};

// アイテムタイプの順番（左詰め順）
const itemOrdering = ["wood", "plank", "stick", "workbench", "wooden_pickaxe", "rock", "item5", "item6", "item7"];

// 公園の位置に資源を配置
parkLocations.forEach(location => {
    const [lat, lng, name, resourceType] = location;
    let icon, marker;
    if (resourceType === "wood") {
        icon = L.divIcon({
            className: 'tree-icon',
            html: '🌲',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        if (!treeMarkers.find(m => m.getLatLng().lat === lat && m.getLatLng().lng === lng)) {
            marker = L.marker([lat, lng], {
                icon: icon,
                draggable: false
            }).addTo(map);
            treeMarkers.push(marker);
        }
    } else if (resourceType === "plank") {
        icon = L.divIcon({
            className: 'tree-icon',
            html: '🔨',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        if (!plankMarkers.find(m => m.getLatLng().lat === lat && m.getLatLng().lng === lng)) {
            marker = L.marker([lat, lng], {
                icon: icon,
                draggable: false
            }).addTo(map);
            plankMarkers.push(marker);
        }
    } else if (resourceType === "rock") {
        icon = L.divIcon({
            className: 'tree-icon',
            html: '🪨',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        if (!rockMarkers.find(m => m.getLatLng().lat === lat && m.getLatLng().lng === lng)) {
            marker = L.marker([lat, lng], {
                icon: icon,
                draggable: false
            }).addTo(map);
            rockMarkers.push(marker);
        }
    }
    if (marker) { // Ensure marker is defined
        marker.parkName = name;
        marker.resourceType = resourceType; // Store resource type
        marker.on('click', (event) => {
            const distance = map.distance(characterPosition, [lat, lng]);
            if (distance <= 20) {
                let count = 2;
                let message = `【${name}】で`;
                if (resourceType === "wood") {
                    inventoryCounts.wood += count;
                    message += `原木を${count}つ`;
                    treeMarkers = treeMarkers.filter(obj => obj !== marker);
                } else if (resourceType === "plank") {
                    inventoryCounts.plank += count;
                    message += `板材を${count}つ`;
                    plankMarkers = plankMarkers.filter(obj => obj !== marker);
                } else if (resourceType === "rock") {
                    inventoryCounts.rock += count;
                    message += `石を${count}つ`;
                    rockMarkers = rockMarkers.filter(obj => obj !== marker);
                }
                message += "入手しました！";
                alert(message);
                updateInventory();
                map.removeLayer(marker);
            } else {
                alert('資源に近づいてタップしてください！');
            }
        });
    }
});
// キャラクターの移動処理
function moveCharacter(e) {
    let newPosition = [...characterPosition];
    const moveDistance = 0.0002; // 移動距離を調整
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            newPosition[0] += moveDistance; // 緯度を増やす (北へ移動)
            break;
        case 'ArrowDown':
        case 's':
            newPosition[0] -= moveDistance; // 緯度を減らす (南へ移動)
            break;
        case 'ArrowLeft':
        case 'a':
            newPosition[1] -= moveDistance; // 経度を減らす (西へ移動)
            break;
        case 'ArrowRight':
        case 'd':
            newPosition[1] += moveDistance; // 経度を増やす (東へ移動)
            break;
        default:
            return; // 何もせずに終了
    }
    // 新しい位置がマップの範囲内にあるか確認する（オプション）
    // 例: ある程度の緯度経度の範囲内のみ移動可能とする
    if (newPosition[0] > 35.65 && newPosition[0] < 35.70 && newPosition[1] > 139.70 && newPosition[1] < 139.75) {
        characterPosition = newPosition;
        characterMarker.setLatLng(characterPosition); // マーカーの位置を更新
    }
}
// キーイベントリスナーを追加
document.addEventListener('keydown', moveCharacter);
// クラフト機能
const craftButton = document.getElementById('craft-button');
const craftScreen = document.getElementById('craft-screen');
const craftGrid = document.getElementById('craft-grid');
const craftResult = document.getElementById('craft-result');
const closeButton = craftScreen.querySelector('.close-button');
const craftArea = document.getElementById('craft-area');
let selectedSlots = [];
let selectedItem = 'wood'; // 初期選択アイテムはwood
// クラフト素材が使用済みかどうかのフラグ
let materialsUsed = false;

// インベントリを左詰め表示に更新する関数
function updateInventory() {
    // デバッグ用: 更新前のインベントリ状態をログに出力
    console.log("インベントリ更新前:", inventoryCounts);

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

    // マップ画面のインベントリアイテムを取得
    const mapInventoryItems = document.querySelectorAll('.inventory > .inventory-item');

    // 全てのインベントリスロットをクリア
    mapInventoryItems.forEach(item => {
        const iconSpan = item.querySelector('span:first-child');
        const countSpan = item.querySelector('span:nth-child(2)');
        const nameDiv = item.querySelector('.item-name');

        iconSpan.textContent = '';
        countSpan.textContent = '';
        item.setAttribute('data-item', '');
        nameDiv.textContent = '';
    });

    // 左詰めでアイテムを表示
    activeItems.forEach((item, index) => {
        if (index < mapInventoryItems.length) {
            const slot = mapInventoryItems[index];
            const iconSpan = slot.querySelector('span:first-child');
            const countSpan = slot.querySelector('span:nth-child(2)');
            const nameDiv = slot.querySelector('.item-name');

            iconSpan.textContent = item.icon;
            countSpan.textContent = item.count;
            slot.setAttribute('data-item', item.type);
            nameDiv.textContent = item.name;
        }
    });

    // クラフト画面が表示されている場合は、そのインベントリも更新
    if (craftScreen.style.display === 'flex') {
        updateCraftInventory();
    }

    // デバッグ用: 更新後のインベントリ表示をログに出力
    console.log("インベントリ更新後の表示:", activeItems);
}

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

        // クラフト結果を更新
        updateCraftResult();
    }
}

// 初期状態でインベントリを更新
updateInventory();

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
            updateCraftResult();
        }
    }
});

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
        else if (activeSlots.length === 5 &&
            itemTypes.filter(type => type === 'plank').length === 3 &&
            itemTypes.filter(type => type === 'stick').length === 2) {
            resultIcon.textContent = itemIcons["wooden_pickaxe"];
            resultCount.textContent = '×1';
            craftResult.classList.add('active');
            craftResult.setAttribute('data-recipe', 'wooden-pickaxe');
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