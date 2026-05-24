document.addEventListener('DOMContentLoaded', () => {
    const btnLocation = document.getElementById('btn-location');
    const statusMessage = document.getElementById('status-message');
    const resultsContainer = document.getElementById('results');
    const filtersSection = document.getElementById('filters');

    // Elementos de filtro
    const fuelTypeSelect = document.getElementById('fuel-type');
    const maxDistanceInput = document.getElementById('max-distance');
    const maxPriceInput = document.getElementById('max-price');
    const sortBySelect = document.getElementById('sort-by');

    // Elementos de cabecera de resultados y vista
    const resultsHeader = document.getElementById('results-header');
    const resultsCount = document.getElementById('results-count');
    const btnViewGrid = document.getElementById('btn-view-grid');
    const btnViewList = document.getElementById('btn-view-list');

    // Botones del selector de idioma
    const btnLangEs = document.getElementById('btn-lang-es');
    const btnLangEn = document.getElementById('btn-lang-en');
    
    // Detectar si se carga desde un móvil para inicializar en lista o cuadrícula
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    let currentView = mediaQuery.matches ? 'list' : 'grid';

    // i18n translations dictionary
    const translations = {
        es: {
            subtitle: "Encuentra tu gasolinera ideal",
            "btn-location": "📍 Buscar cerca de mi ubicación",
            "label-fuel": "⛽ Combustible:",
            "label-distance": "📏 Distancia máxima (km):",
            "label-price": "💶 Precio máximo (€/l):",
            "label-sort": "↕️ Ordenar por:",
            "fuel-all": "Cualquiera",
            "fuel-gasolina": "Gasolina 95",
            "fuel-diesel": "Diésel",
            "sort-price-asc": "💶 Precio: más baratas primero",
            "sort-price-desc": "💶 Precio: más caras primero",
            "sort-distance-asc": "📏 Distancia: más cercanas primero",
            "sort-distance-desc": "📏 Distancia: más lejanas primero",
            "btn-view-grid": "⊞ Cuadrícula",
            "btn-view-list": "☰ Lista",
            
            // Textos dinámicos en JS
            viewGridTitle: "Vista cuadrícula",
            viewListTitle: "Vista lista",
            statusNoGeolocation: "❌ Tu navegador no soporta la geolocalización.",
            statusGettingLocation: "📍 Obteniendo tu ubicación...",
            statusStartingDownload: "📡 Iniciando descarga de gasolineras...",
            statusDownloading: (percent, loadedMB, totalMB) => totalMB > 0 
                ? `📡 Descargando datos: ${percent}% (${loadedMB} MB de ${totalMB} MB)...`
                : `📡 Descargando datos: ${loadedMB} MB descargados...`,
            statusProcessing: "⚙️ Procesando e interpretando datos descargados...",
            statusCalculating: "⚙️ Procesando coordenadas y calculando en kilómetros...",
            statusSuccess: "✅ Resultados actualizados. Puedes usar los filtros.",
            statusError: "❌ No se pudieron cargar los datos.",
            statusGeoError: "❌ Error al obtener ubicación. Verifica los permisos de tu navegador.",
            noStationsFound: "No se han encontrado gasolineras con estos filtros.",
            stationsFound: (count) => `Se han encontrado ${count} gasolineras`,
            notAvailable: "No disponible",
            kilometers: "kilómetros",
            navGoogleMaps: "Navegar con Google Maps",
            navWaze: "Navegar con Waze",
            navAppleMaps: "Navegar con Apple Maps",
            gasolina95Label: "Gasolina 95:",
            dieselLabel: "Diésel:"
        },
        en: {
            subtitle: "Find your ideal gas station",
            "btn-location": "📍 Find near my location",
            "label-fuel": "⛽ Fuel Type:",
            "label-distance": "📏 Max Distance (km):",
            "label-price": "💶 Max Price (€/l):",
            "label-sort": "↕️ Sort by:",
            "fuel-all": "Any",
            "fuel-gasolina": "Gasoline 95",
            "fuel-diesel": "Diesel",
            "sort-price-asc": "💶 Price: cheapest first",
            "sort-price-desc": "💶 Price: most expensive first",
            "sort-distance-asc": "📏 Distance: closest first",
            "sort-distance-desc": "📏 Distance: farthest first",
            "btn-view-grid": "⊞ Grid",
            "btn-view-list": "☰ List",
            
            // Dynamic JS texts
            viewGridTitle: "Grid view",
            viewListTitle: "List view",
            statusNoGeolocation: "❌ Your browser does not support geolocation.",
            statusGettingLocation: "📍 Obtaining your location...",
            statusStartingDownload: "📡 Starting download of gas stations...",
            statusDownloading: (percent, loadedMB, totalMB) => totalMB > 0 
                ? `📡 Downloading data: ${percent}% (${loadedMB} MB of ${totalMB} MB)...`
                : `📡 Downloading data: ${loadedMB} MB downloaded...`,
            statusProcessing: "⚙️ Processing and parsing downloaded data...",
            statusCalculating: "⚙️ Processing coordinates and calculating in kilometers...",
            statusSuccess: "✅ Results updated. You can use the filters.",
            statusError: "❌ Could not load the data.",
            statusGeoError: "❌ Error obtaining location. Please check browser permissions.",
            noStationsFound: "No gas stations found with these filters.",
            stationsFound: (count) => `Found ${count} gas stations`,
            notAvailable: "Not available",
            kilometers: "kilometers",
            navGoogleMaps: "Navigate with Google Maps",
            navWaze: "Navigate with Waze",
            navAppleMaps: "Navigate with Apple Maps",
            gasolina95Label: "Gasoline 95:",
            dieselLabel: "Diesel:"
        }
    };

    let currentLang = getPreferredLanguage();

    function getPreferredLanguage() {
        const savedLang = localStorage.getItem('fuelier-language');
        if (savedLang) return savedLang;

        // Autodetectar el idioma del dispositivo del usuario
        const browserLang = navigator.language || navigator.userLanguage || 'es';
        if (browserLang.toLowerCase().startsWith('en')) {
            return 'en';
        }
        return 'es';
    }

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('fuelier-language', lang);

        // Actualizar botones de selección de idioma
        if (btnLangEs && btnLangEn) {
            btnLangEs.classList.toggle('active', lang === 'es');
            btnLangEn.classList.toggle('active', lang === 'en');
        }

        // Traducir todos los elementos marcados con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = translations[lang][key];
            if (translation) {
                if (el.tagName === 'OPTION') {
                    el.textContent = translation;
                } else if (el.id === 'btn-location') {
                    el.innerHTML = lang === 'es' ? '📍 Buscar cerca de mi ubicación' : '📍 Find near my location';
                } else if (el.id === 'btn-view-grid') {
                    el.innerHTML = lang === 'es' ? '⊞ Cuadrícula' : '⊞ Grid';
                    el.title = translations[lang].viewGridTitle;
                } else if (el.id === 'btn-view-list') {
                    el.innerHTML = lang === 'es' ? '☰ Lista' : '☰ List';
                    el.title = translations[lang].viewListTitle;
                } else {
                    el.innerHTML = translation;
                }
            }
        });

        // Reconstruir selectores premium para reflejar la traducción
        refreshCustomSelects();

        // Si ya hay datos cargados, refrescar la visualización
        if (allStations.length > 0) {
            applyFilters();
        }
    }

    function refreshCustomSelects() {
        document.querySelectorAll('.custom-select-container').forEach(container => {
            const select = container.querySelector('select');
            if (select) {
                select.classList.remove('hidden-select');
                container.parentNode.insertBefore(select, container);
            }
            container.remove();
        });
        setupCustomSelects();
    }

    function updateViewForDevice() {
        if (mediaQuery.matches) {
            // En móvil, forzar vista lista y ocultar la cuadrícula
            currentView = 'list';
            if (resultsContainer) {
                resultsContainer.className = 'results-list';
            }
            if (btnViewList && btnViewGrid) {
                btnViewList.classList.add('active');
                btnViewGrid.classList.remove('active');
            }
        } else {
            // En escritorio, restaurar la vista según los botones activos
            if (btnViewGrid && btnViewList) {
                currentView = btnViewGrid.classList.contains('active') ? 'grid' : 'list';
            } else {
                currentView = 'grid';
            }
            if (resultsContainer) {
                resultsContainer.className = currentView === 'grid' ? 'results-grid' : 'results-list';
            }
        }
    }

    // Inicializar la vista
    updateViewForDevice();

    // Escuchar cambios de tamaño de pantalla en tiempo real (comportamiento premium)
    mediaQuery.addEventListener('change', updateViewForDevice);

    const API_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
    
    let allStations = []; // Aquí guardaremos los datos descargados para filtrar en cliente

    // Eventos
    btnLocation.addEventListener('click', getUserLocation);
    fuelTypeSelect.addEventListener('change', applyFilters);
    maxDistanceInput.addEventListener('input', applyFilters);
    maxPriceInput.addEventListener('input', applyFilters);
    sortBySelect.addEventListener('change', applyFilters);

    if (btnLangEs && btnLangEn) {
        btnLangEs.addEventListener('click', () => setLanguage('es'));
        btnLangEn.addEventListener('click', () => setLanguage('en'));
    }

    btnViewGrid.addEventListener('click', () => {
        if (currentView === 'grid') return;
        currentView = 'grid';
        btnViewGrid.classList.add('active');
        btnViewList.classList.remove('active');
        resultsContainer.className = 'results-grid';
    });

    btnViewList.addEventListener('click', () => {
        if (currentView === 'list') return;
        currentView = 'list';
        btnViewList.classList.add('active');
        btnViewGrid.classList.remove('active');
        resultsContainer.className = 'results-list';
    });

    function setStatus(message) {
        statusMessage.textContent = message;
    }

    function getUserLocation() {
        if (!navigator.geolocation) {
            setStatus(translations[currentLang].statusNoGeolocation);
            return;
        }

        btnLocation.disabled = true;
        setStatus(translations[currentLang].statusGettingLocation);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                fetchGasStations(userLat, userLon);
            },
            (error) => handleGeolocationError(error),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }

    async function fetchGasStations(userLat, userLon) {
        setStatus(translations[currentLang].statusStartingDownload);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Error en la red');
            
            const contentLength = response.headers.get('content-length');
            const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
            let loadedBytes = 0;
            
            const reader = response.body.getReader();
            const chunks = [];
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                chunks.push(value);
                loadedBytes += value.length;
                
                const loadedMB = (loadedBytes / (1024 * 1024)).toFixed(2);
                const totalMB = totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(2) : 0;
                const percent = totalBytes > 0 ? Math.round((loadedBytes / totalBytes) * 100) : 0;
                
                setStatus(translations[currentLang].statusDownloading(percent, loadedMB, totalMB));
            }
            
            setStatus(translations[currentLang].statusProcessing);
            
            // Unir todos los fragmentos (Uint8Array)
            const chunksAll = new Uint8Array(loadedBytes);
            let position = 0;
            for (const chunk of chunks) {
                chunksAll.set(chunk, position);
                position += chunk.length;
            }
            
            // Decodificar textualmente y parsear JSON
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(chunksAll);
            const data = JSON.parse(text);
            
            setStatus(translations[currentLang].statusCalculating);
            processStations(data.ListaEESSPrecio, userLat, userLon);

            // Mostrar sección de filtros una vez tenemos los datos
            filtersSection.classList.remove('hidden');
            setStatus(translations[currentLang].statusSuccess);

        } catch (error) {
            console.error(error);
            setStatus(translations[currentLang].statusError);
            btnLocation.disabled = false;
        }
    }

    // Función auxiliar para convertir el string de precio de la API a número decimal
    function parsePrice(priceStr) {
        if (!priceStr) return null;
        return parseFloat(priceStr.replace(',', '.'));
    }

    function processStations(stations, userLat, userLon) {
        allStations = stations.map(station => {
            const lat = parseFloat(station['Latitud'].replace(',', '.'));
            const lon = parseFloat(station['Longitud (WGS84)'].replace(',', '.'));
            
            return {
                name: station['Rótulo'],
                address: station['Dirección'],
                lat: lat,
                lon: lon,
                distance: calculateDistance(userLat, userLon, lat, lon), // Calculado en kilómetros
                price95: parsePrice(station['Precio Gasolina 95 E5']),
                priceDiesel: parsePrice(station['Precio Gasoleo A'])
            };
        }).filter(s => !isNaN(s.distance)); // Descartar las que no tienen coordenadas válidas

        applyFilters(); // Aplicar filtros con los valores por defecto del HTML
    }

    function applyFilters() {
        const fuelType = fuelTypeSelect.value;
        const maxDistance = parseFloat(maxDistanceInput.value) || 50;
        const maxPrice = parseFloat(maxPriceInput.value) || 3;
        const sortBy = sortBySelect.value;

        const filteredStations = allStations.filter(station => {
            // 1. Filtro por distancia en kilómetros
            if (station.distance > maxDistance) return false;

            // 2. Filtro por tipo de combustible y precio máximo
            let isValid = false;

            if (fuelType === 'all') {
                if ((station.price95 && station.price95 <= maxPrice) || 
                    (station.priceDiesel && station.priceDiesel <= maxPrice)) {
                    isValid = true;
                }
            } else if (fuelType === 'gasolina') {
                if (station.price95 && station.price95 <= maxPrice) isValid = true;
            } else if (fuelType === 'diesel') {
                if (station.priceDiesel && station.priceDiesel <= maxPrice) isValid = true;
            }

            return isValid;
        });

        // Ordenamos los resultados
        filteredStations.sort((a, b) => {
            if (sortBy === 'price-asc' || sortBy === 'price-desc') {
                // Obtenemos el precio de comparación según el tipo de combustible
                let priceA = Infinity;
                let priceB = Infinity;
                
                if (fuelType === 'gasolina') {
                    priceA = a.price95 !== null ? a.price95 : Infinity;
                    priceB = b.price95 !== null ? b.price95 : Infinity;
                } else if (fuelType === 'diesel') {
                    priceA = a.priceDiesel !== null ? a.priceDiesel : Infinity;
                    priceB = b.priceDiesel !== null ? b.priceDiesel : Infinity;
                } else {
                    // Si es "Cualquiera", comparamos el precio más bajo disponible
                    const aPrices = [a.price95, a.priceDiesel].filter(p => p !== null);
                    const bPrices = [b.price95, b.priceDiesel].filter(p => p !== null);
                    priceA = aPrices.length > 0 ? Math.min(...aPrices) : Infinity;
                    priceB = bPrices.length > 0 ? Math.min(...bPrices) : Infinity;
                }
                
                if (sortBy === 'price-asc') {
                    // Más baratas primero
                    if (priceA !== priceB) return priceA - priceB;
                } else {
                    // Más caras primero (las sin precio van al final)
                    const realA = priceA === Infinity ? -Infinity : priceA;
                    const realB = priceB === Infinity ? -Infinity : priceB;
                    if (realA !== realB) return realB - realA;
                }
                // Si tienen el mismo precio, ordenamos por distancia
                return a.distance - b.distance;
            } else if (sortBy === 'distance-asc') {
                return a.distance - b.distance;
            } else if (sortBy === 'distance-desc') {
                return b.distance - a.distance;
            }
            return 0;
        });

        // Limitamos a 30 resultados para no sobrecargar el navegador
        renderStations(filteredStations.slice(0, 30));
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio terrestre en kilómetros
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
    }

    function renderStations(stations) {
        resultsContainer.innerHTML = '';

        if (stations.length === 0) {
            resultsHeader.classList.add('hidden');
            resultsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">${translations[currentLang].noStationsFound}</p>`;
            return;
        }

        // Mostrar cabecera y actualizar contador
        resultsHeader.classList.remove('hidden');
        resultsCount.textContent = translations[currentLang].stationsFound(stations.length);
        resultsContainer.className = currentView === 'grid' ? 'results-grid' : 'results-list';

        stations.forEach(station => {
            // Formatear precios según el idioma (coma en español, punto en inglés)
            const formatPrice = (price) => {
                if (!price) return translations[currentLang].notAvailable;
                const formatted = currentLang === 'es' ? price.toFixed(3).replace('.', ',') : price.toFixed(3);
                return `${formatted}&nbsp;€/l`;
            };

            // Mostrar y resaltar precios según el tipo de combustible seleccionado
            const selectedFuel = fuelTypeSelect.value;
            const isGasSelected = selectedFuel === 'gasolina';
            const isDieselSelected = selectedFuel === 'diesel';

            const price95HTML = (station.price95 && (selectedFuel === 'all' || selectedFuel === 'gasolina')) ? 
                `<li class="price-item"><span class="price-label">${translations[currentLang].gasolina95Label}</span> 
                 <span class="price-value" style="color: ${isGasSelected ? 'var(--primary-color)' : 'inherit'}">${formatPrice(station.price95)}</span></li>` : '';
                 
            const priceDieselHTML = (station.priceDiesel && (selectedFuel === 'all' || selectedFuel === 'diesel')) ? 
                `<li class="price-item"><span class="price-label">${translations[currentLang].dieselLabel}</span> 
                 <span class="price-value" style="color: ${isDieselSelected ? 'var(--primary-color)' : 'inherit'}">${formatPrice(station.priceDiesel)}</span></li>` : '';

            const card = document.createElement('article');
            card.className = 'card';

            card.innerHTML = `
                <div class="card-info">
                    <h2>${station.name}</h2>
                    <div class="distance">${station.distance.toFixed(2)} ${translations[currentLang].kilometers}</div>
                    <p class="address">${station.address}</p>
                </div>
                <div class="card-prices">
                    <ul class="price-list">
                        ${price95HTML}
                        ${priceDieselHTML}
                    </ul>
                </div>
                <div class="card-nav">
                    <div class="nav-buttons">
                        <a href="#" class="btn-nav btn-nav-google" title="${translations[currentLang].navGoogleMaps}">
                            <img src="assets/google-maps.svg" alt="Google Maps" class="nav-icon">
                        </a>
                        <a href="#" class="btn-nav btn-nav-waze" title="${translations[currentLang].navWaze}">
                            <img src="assets/waze.svg" alt="Waze" class="nav-icon">
                        </a>
                        <a href="#" class="btn-nav btn-nav-apple" title="${translations[currentLang].navAppleMaps}">
                            <img src="assets/apple-maps.svg" alt="Apple Maps" class="nav-icon">
                        </a>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(card);

            // Escuchar clics para realizar redirección inteligente (deep linking con fallback web)
            const googleBtn = card.querySelector('.btn-nav-google');
            const wazeBtn = card.querySelector('.btn-nav-waze');
            const appleBtn = card.querySelector('.btn-nav-apple');

            googleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openGoogleMaps(station.lat, station.lon);
            });
            wazeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openWaze(station.lat, station.lon);
            });
            appleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openAppleMaps(station.lat, station.lon);
            });
        });
    }

    // Crear selectores personalizados premium a partir de los selectores HTML nativos
    function setupCustomSelects() {
        const selects = document.querySelectorAll('select.filter-input');
        
        const optionIcons = {
            'all': '⛽',
            'gasolina': '🟢',
            'diesel': '🟡'
        };
        
        selects.forEach(select => {
            // Ocultar select original de manera accesible
            select.classList.add('hidden-select');
            
            // Crear contenedor de la estructura personalizada
            const container = document.createElement('div');
            container.className = 'custom-select-container';
            select.parentNode.insertBefore(container, select);
            container.appendChild(select); // Mover el select original dentro del contenedor
            
            // Crear botón de disparo (lo que el usuario ve)
            const trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'custom-select-trigger';
            
            const selectedOpt = select.options[select.selectedIndex];
            const selectedIcon = optionIcons[selectedOpt.value] || '';
            
            trigger.innerHTML = `
                <span class="trigger-label">${selectedIcon ? `<span class="trigger-icon">${selectedIcon}</span> ` : ''}<span class="trigger-text">${selectedOpt.text}</span></span>
                <svg class="chevron" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            `;
            container.appendChild(trigger);
            
            // Interceptar clics en el label asociado para evitar disparar el desplegable nativo del SO
            const label = document.querySelector(`label[for="${select.id}"]`);
            if (label) {
                // Remover listeners anteriores para evitar duplicidades
                const newLabel = label.cloneNode(true);
                label.parentNode.replaceChild(newLabel, label);
                
                newLabel.addEventListener('click', (e) => {
                    e.preventDefault();
                    trigger.focus();
                    trigger.click();
                });
            }
            
            // Crear la lista desplegable de opciones personalizadas
            const list = document.createElement('ul');
            list.className = 'custom-options-list';
            list.setAttribute('role', 'listbox');
            
            Array.from(select.options).forEach((opt) => {
                const li = document.createElement('li');
                li.className = 'custom-option';
                li.setAttribute('role', 'option');
                if (opt.selected) {
                    li.classList.add('selected');
                    li.setAttribute('aria-selected', 'true');
                } else {
                    li.setAttribute('aria-selected', 'false');
                }
                li.dataset.value = opt.value;
                
                const icon = optionIcons[opt.value] || '';
                li.innerHTML = `<span class="opt-text">${icon ? `<span class="opt-icon">${icon}</span> ` : ''}${opt.text}</span>`;
                
                li.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Actualizar estados visuales de selección
                    container.querySelectorAll('.custom-option').forEach(item => {
                        item.classList.remove('selected');
                        item.setAttribute('aria-selected', 'false');
                    });
                    
                    li.classList.add('selected');
                    li.setAttribute('aria-selected', 'true');
                    
                    const currentIcon = optionIcons[opt.value] || '';
                    trigger.querySelector('.trigger-label').innerHTML = `${currentIcon ? `<span class="trigger-icon">${currentIcon}</span> ` : ''}<span class="trigger-text">${opt.text}</span>`;
                    
                    // Sincronizar el select original y disparar evento de cambio
                    select.value = opt.value;
                    select.dispatchEvent(new Event('change'));
                    
                    // Cerrar el dropdown
                    container.classList.remove('active');
                });
                
                list.appendChild(li);
            });
            
            container.appendChild(list);
            
            // Abrir y cerrar al hacer click en el botón trigger
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Cerrar otros dropdowns personalizados que puedan estar abiertos
                document.querySelectorAll('.custom-select-container').forEach(other => {
                    if (other !== container) other.classList.remove('active');
                });
                
                container.classList.toggle('active');
            });
        });
        
        // Cerrar los menús desplegables si se hace click en cualquier otra parte del documento
        document.removeEventListener('click', closeDropdowns);
        document.addEventListener('click', closeDropdowns);
    }

    function closeDropdowns() {
        document.querySelectorAll('.custom-select-container').forEach(container => {
            container.classList.remove('active');
        });
    }

    function openGoogleMaps(lat, lon) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isAndroid = /Android/.test(navigator.userAgent);
        
        let deepLink = '';
        if (isIOS) {
            deepLink = `comgooglemaps://?daddr=${lat},${lon}&directionsmode=driving`;
        } else if (isAndroid) {
            deepLink = `google.navigation:q=${lat},${lon}`;
        }
        
        const webLink = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        
        if (!deepLink) {
            window.open(webLink, '_blank');
            return;
        }
        
        const start = Date.now();
        window.location.href = deepLink;
        
        setTimeout(() => {
            if (document.hidden || document.webkitHidden) return;
            if (Date.now() - start < 2000) {
                window.open(webLink, '_blank');
            }
        }, 1500);
    }

    function openWaze(lat, lon) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isAndroid = /Android/.test(navigator.userAgent);
        const isMobile = isIOS || isAndroid;
        
        const deepLink = `waze://?ll=${lat},${lon}&navigate=yes`;
        const webLink = `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
        
        if (!isMobile) {
            window.open(webLink, '_blank');
            return;
        }
        
        const start = Date.now();
        window.location.href = deepLink;
        
        setTimeout(() => {
            if (document.hidden || document.webkitHidden) return;
            if (Date.now() - start < 2000) {
                window.open(webLink, '_blank');
            }
        }, 1500);
    }

    function openAppleMaps(lat, lon) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isMac = /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 0;
        
        const deepLink = `maps://?daddr=${lat},${lon}`;
        const webLink = `https://maps.apple.com/?daddr=${lat},${lon}`;
        
        if (isIOS || isMac || navigator.platform.indexOf('Mac') > -1) {
            window.location.href = deepLink;
        } else {
            window.open(webLink, '_blank');
        }
    }

    function handleGeolocationError(error) {
        btnLocation.disabled = false;
        setStatus(translations[currentLang].statusGeoError);
    }

    // Inicializar el idioma al cargar la página (esto genera también los selectores premium con la traducción adecuada)
    setLanguage(currentLang);
});
