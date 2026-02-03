// Navigation functionality
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const logo = document.getElementById('logoBtn');

function showPage(pageName) {
    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    document.getElementById(pageName).classList.add('active');
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const pageName = this.getAttribute('data-page');
        showPage(pageName);
    });
});

logo.addEventListener('click', function() {
    showPage('home');
});

// CSV Data Loading
let tvData = [];
const tvContainer = document.getElementById('tvContainer');
const controls = document.getElementById('controls');
const filterType = document.getElementById('filterType');
const filterBrand = document.getElementById('filterBrand');
const sortBy = document.getElementById('sortBy');
const resetBtn = document.getElementById('resetBtn');

// Load CSV file from data folder
fetch('data/data.csv')
    .then(response => {
        if (!response.ok) {
            throw new Error('CSV file not found. Please make sure data.csv is in the data folder.');
        }
        return response.text();
    })
    .then(csvText => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                tvData = results.data;
                populateBrandFilter();
                displayTVs(tvData);
            }
        });
    })
    .catch(error => {
        tvContainer.innerHTML = `
            <div class="content-card" style="background-color: #fff3cd; border-left-color: #ffc107;">
                <h2>CSV File Not Found</h2>
                <p><strong>Error:</strong> ${error.message}</p>
                <p>Please create a file named <strong>televisions.csv</strong> in the <strong>data</strong> folder.</p>
                <p>The CSV file should have this format:</p>
                <pre style="background: #f5f5f5; padding: 1rem; border-radius: 5px; overflow-x: auto;">Brand,Model,Screen_Size,Type,Energy_Rating,Annual_Energy_kWh,Annual_Cost,Price
Samsung,QE55S95B,55,OLED,5,95,28.50,1899
LG,OLED55C3,55,OLED,5,98,29.40,1699</pre>
            </div>
        `;
    });

function populateBrandFilter() {
    const brands = [...new Set(tvData.map(tv => tv.Brand))].sort();
    filterBrand.innerHTML = '<option value="all">All Brands</option>';
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        filterBrand.appendChild(option);
    });
}

function displayTVs(data) {
    if (data.length === 0) {
        tvContainer.innerHTML = '<div class="no-data">No TV data available.</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'tv-grid';

    data.forEach(tv => {
        const card = document.createElement('div');
        card.className = 'tv-card';
        
        const stars = '★'.repeat(parseInt(tv.Energy_Rating || 0)) + '☆'.repeat(5 - parseInt(tv.Energy_Rating || 0));
        
        card.innerHTML = `
            <div class="brand">${tv.Brand || 'Unknown'}</div>
            <h3>${tv.Model || 'Unknown Model'}</h3>
            <div class="energy-rating">${stars} ${tv.Energy_Rating || 'N/A'} Stars</div>
            <div class="tv-specs">
                <p><strong>Screen Size:</strong> ${tv.Screen_Size || 'N/A'}"</p>
                <p><strong>Type:</strong> ${tv.Type || 'N/A'}</p>
                <p><strong>Annual Energy:</strong> ${tv.Annual_Energy_kWh || 'N/A'} kWh</p>
                <p><strong>Annual Cost:</strong> $${tv.Annual_Cost || 'N/A'}</p>
            </div>
            <div class="price">$${tv.Price || 'N/A'}</div>
        `;
        
        grid.appendChild(card);
    });

    tvContainer.innerHTML = '';
    tvContainer.appendChild(grid);
}

function filterAndSort() {
    let filtered = [...tvData];

    // Apply type filter
    if (filterType.value !== 'all') {
        filtered = filtered.filter(tv => tv.Type === filterType.value);
    }

    // Apply brand filter
    if (filterBrand.value !== 'all') {
        filtered = filtered.filter(tv => tv.Brand === filterBrand.value);
    }

    // Apply sorting
    switch(sortBy.value) {
        case 'energy':
            filtered.sort((a, b) => (parseFloat(b.Energy_Rating) || 0) - (parseFloat(a.Energy_Rating) || 0));
            break;
        case 'price-low':
            filtered.sort((a, b) => (parseFloat(a.Price) || 0) - (parseFloat(b.Price) || 0));
            break;
        case 'price-high':
            filtered.sort((a, b) => (parseFloat(b.Price) || 0) - (parseFloat(a.Price) || 0));
            break;
        case 'consumption':
            filtered.sort((a, b) => (parseFloat(a.Annual_Energy_kWh) || 0) - (parseFloat(b.Annual_Energy_kWh) || 0));
            break;
    }

    displayTVs(filtered);
}

filterType.addEventListener('change', filterAndSort);
filterBrand.addEventListener('change', filterAndSort);
sortBy.addEventListener('change', filterAndSort);

resetBtn.addEventListener('click', function() {
    filterType.value = 'all';
    filterBrand.value = 'all';
    sortBy.value = 'energy';
    displayTVs(tvData);
});