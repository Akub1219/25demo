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
    [35.67290910615022, 139.7259926039698, "赤坂郵便局駐車場", "rock"],
];

// 木のアイコンを保持する配列
let treeMarkers = [];
let plankMarkers = [];
let rockMarkers = [];

// インベントリアイテムカウント
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

// モーダル関連の要素
const imageDetailModal = document.getElementById('image-detail-modal');
const detailImage = document.getElementById('detail-image');
const detailLocation = document.getElementById('detail-location');
const detailTitle = document.getElementById('detail-title');
const detailAuthor = document.getElementById('detail-author');
const closeModalBtn = document.querySelector('.close-modal');

// モーダルを閉じる処理
closeModalBtn.addEventListener('click', () => {
    imageDetailModal.style.display = 'none';
});

// モーダル外をクリックしても閉じる
window.addEventListener('click', (event) => {
    if (event.target === imageDetailModal) {
        imageDetailModal.style.display = 'none';
    }
});

// 画像詳細を表示する関数
function showImageDetail(markerData) {
    // 拡大画像のパスを設定（通常画像のパスから大きいサイズ用のパスを生成）
    const largeImagePath = markerData.imagePath.replace('.png', '_large.png');

    // モーダル内の要素に情報をセット
    detailImage.src = largeImagePath;
    detailImage.alt = markerData.title;
    detailLocation.textContent = markerData.location_name;
    detailTitle.textContent = markerData.artwork_name;
    detailAuthor.textContent = markerData.author;

    // モーダルを表示
    imageDetailModal.style.display = 'block';
}

// 画像アイコンのマーカーを作成する共通関数
function createImageMarker(markerData) {
    const { location, imagePath, location_name, artwork_name, author } = markerData;

    // 画像アイコンを作成
    const imgIcon = L.divIcon({
        className: 'image-icon',
        html: `<img src="${imagePath}" width="64" height="64" alt="${artwork_name}">`,
        iconSize: [64, 64],
        iconAnchor: [32, 32]
    });

    // マーカーを作成
    const marker = L.marker(location, {
        icon: imgIcon,
        draggable: false
    }).addTo(map);

    // データを保存
    marker.markerData = markerData;

    // クリックイベントを追加
    marker.on('click', () => {
        const distance = map.distance(characterPosition, location);
        if (distance <= 50) { // 50は取得可能距離
            // 詳細情報を表示
            showImageDetail(markerData);
        } else {
            alert('もう少し近づいてください！');
        }
    });

    return marker;
}

// 画像マーカーの配置データ
const imageMarkers = [{
        location: [35.67235031877122, 139.7239866927539], // ホンダウエルカムプラザ青山
        imagePath: "img/car.png",
        location_name: "ホンダウエルカムプラザ青山",
        artwork_name: "車",
        author: "Taro"
    },
    {
        location: [35.67445798200324, 139.72255009004144], // 港区立青山中学校
        imagePath: "img/school.png",
        location_name: "港区立青山中学校",
        artwork_name: "校舎",
        author: "Hanako"
    },
    {
        location: [35.671128341719076, 139.72224087900298], // 彌助稲荷大明神
        imagePath: "img/torii.png",
        location_name: "彌助稲荷大明神",
        artwork_name: "鳥居",
        author: "Jiro"
    }
];

// 画像マーカーを保持する配列
let customImageMarkers = [];

// 画像マーカーを作成
imageMarkers.forEach(markerData => {
    const marker = createImageMarker(markerData);
    customImageMarkers.push(marker);
});

// 公園の位置に資源を配置
parkLocations.forEach(location => {
    const [lat, lng, name, resourceType] = location;
    let icon, marker;
    if (resourceType === "wood") {
        icon = L.divIcon({
            className: 'tree-icon',
            html: '🌲',
            iconSize: [64, 64],
            iconAnchor: [32, 32]
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
            iconSize: [64, 64],
            iconAnchor: [32, 32]
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
            iconSize: [64, 64],
            iconAnchor: [32, 32]
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
            if (distance <= 40) {
                let count = 2;
                let message = `【${name}】で`;

                // 石リソースの場合、ツルハシを持っているか確認
                if (resourceType === "rock") {
                    // 木のツルハシか石のツルハシを持っているかチェック
                    const hasWoodenPickaxe = inventoryCounts.wooden_pickaxe > 0;
                    const hasStonePickaxe = inventoryCounts.item5 > 0;

                    if (!hasWoodenPickaxe && !hasStonePickaxe) {
                        alert('石を採掘するにはツルハシが必要です！');
                        return; // 処理を中断
                    }

                    inventoryCounts.rock += count;
                    message += `石を${count}つ`;
                    rockMarkers = rockMarkers.filter(obj => obj !== marker);
                } else if (resourceType === "wood") {
                    inventoryCounts.wood += count;
                    message += `原木を${count}つ`;
                    treeMarkers = treeMarkers.filter(obj => obj !== marker);
                } else if (resourceType === "plank") {
                    inventoryCounts.plank += count;
                    message += `板材を${count}つ`;
                    plankMarkers = plankMarkers.filter(obj => obj !== marker);
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

    // 作業台画面が表示されている場合は、そのインベントリも更新
    if (workbenchScreen.style.display === 'flex') {
        updateWorkbenchInventory();
    }

    // デバッグ用: 更新後のインベントリ表示をログに出力
    console.log("インベントリ更新後の表示:", activeItems);
}

// マップ画面のインベントリアイテムクリックイベントを設定
function setInventoryItemClickEvents() {
    const mapInventoryItems = document.querySelectorAll('.inventory > .inventory-item');

    mapInventoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const itemType = item.getAttribute('data-item');

            // アイテムが作業台で、所持数が1以上の場合
            if (itemType === 'workbench' && inventoryCounts['workbench'] > 0) {
                openWorkbenchScreen();
            }
        });
    });
}

// 初期化処理: マップ画面のインベントリアイテムクリックイベントを設定
window.addEventListener('load', () => {
    setInventoryItemClickEvents();
    updateInventory();
});