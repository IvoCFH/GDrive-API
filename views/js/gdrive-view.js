let searchBtn = document.getElementById('searchBtn');
let searchUrl = searchBtn.href;
let createFolderBtn = document.getElementById('createFolderBtn');
let createFolderUrl = createFolderBtn.href;

const searchInputChange = () => {
    let input = document.getElementById('searchInput');
    searchBtn.href = searchUrl + input.value;
}

const createFolderInputChange = () => {
    let input = document.getElementById('createFolderInput');
    createFolderBtn.href = createFolderUrl + input.value;
};
