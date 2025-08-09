class CardNewsManager {
    constructor() {
        this.allCards = [];
        this.filteredCards = [];
        this.currentPage = 1;
        this.cardsPerPage = 6;
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        this.init();
    }

    async init() {
        await this.loadCardNews();
        this.setupEventListeners();
        this.renderCards();
    }

    async loadCardNews() {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }

        try {
            // JSON 파일에서 카드뉴스 목록 로드
            const response = await fetch('data/news-list.json');
            if (!response.ok) {
                throw new Error('카드뉴스 목록을 불러올 수 없습니다.');
            }
            
            this.allCards = await response.json();
            this.filteredCards = [...this.allCards];
            
            // 날짜순 정렬 (최신순)
            this.filteredCards.sort((a, b) => new Date(b.date) - new Date(a.date));
            
        } catch (error) {
            console.error('Error loading card news:', error);
            
            // 샘플 데이터 (JSON 파일이 없을 경우)
            this.allCards = [
                {
                    id: "card-001",
                    title: "재건축 추진준비위원회 위원 모집 공고",
                    description: "광장현대 5단지 재건축 추진준비위원회 위원을 모집합니다",
                    category: "공지사항",
                    date: "2025-07-30",
                    filename: "news/20250730_card_01.html",
                    views: 0,
                    thumbnail: null
                },
                {
                    id: "card-002",
                    title: "재건축 동의 vs 투표 완벽 가이드",
                    description: "재건축 동의와 투표의 차이점과 전자시스템 허용 일정",
                    category: "알아두기",
                    date: "2025-07-25",
                    filename: "news/20250725_card_01.html",
                    views: 0,
                    thumbnail: null
                },
                {
                    id: "card-003",
                    title: "임시 준비위원회 추진 계획",
                    description: "임시 준비위원회에서 공식 추진위원회까지의 로드맵",
                    category: "재건축",
                    date: "2025-07-21",
                    filename: "news/20250721_card_01.html",
                    views: 0,
                    thumbnail: null
                },
                {
                    id: "card-004",
                    title: "재건축 추진 준비위원회 시작",
                    description: "재건축 추진 준비위원회가 시작됩니다",
                    category: "재건축",
                    date: "2025-07-19",
                    filename: "news/20250719_card_01.html",
                    views: 0,
                    thumbnail: null
                }
            ];
            this.filteredCards = [...this.allCards];
        }

        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    setupEventListeners() {
        // 검색 기능
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // 카테고리 필터
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 기존 active 클래스 제거
                filterBtns.forEach(b => b.classList.remove('active'));
                // 클릭된 버튼에 active 클래스 추가
                e.target.classList.add('active');
                
                this.currentCategory = e.target.dataset.category;
                this.applyFilters();
            });
        });
    }

    applyFilters() {
        this.filteredCards = this.allCards.filter(card => {
            // 카테고리 필터
            const categoryMatch = this.currentCategory === 'all' || 
                                card.category === this.currentCategory;
            
            // 검색 필터
            const searchMatch = this.searchQuery === '' ||
                               card.title.toLowerCase().includes(this.searchQuery) ||
                               card.description.toLowerCase().includes(this.searchQuery) ||
                               card.category.toLowerCase().includes(this.searchQuery);
            
            return categoryMatch && searchMatch;
        });

        this.currentPage = 1;
        this.renderCards();
        this.renderPagination();
    }

    renderCards() {
        const cardsGrid = document.getElementById('cardsGrid');
        const noResults = document.getElementById('noResults');
        
        if (!cardsGrid) return;
        
        if (this.filteredCards.length === 0) {
            cardsGrid.innerHTML = '';
            if (noResults) {
                noResults.style.display = 'block';
            }
            return;
        }

        if (noResults) {
            noResults.style.display = 'none';
        }

        // 페이지네이션 계산
        const startIndex = (this.currentPage - 1) * this.cardsPerPage;
        const endIndex = startIndex + this.cardsPerPage;
        const currentCards = this.filteredCards.slice(startIndex, endIndex);

        cardsGrid.innerHTML = currentCards.map(card => this.createCardHTML(card)).join('');

        // 카드 클릭 이벤트 추가
        const cardElements = cardsGrid.querySelectorAll('.card');
        cardElements.forEach((cardEl, index) => {
            cardEl.addEventListener('click', () => {
                const card = currentCards[index];
                this.openCardNews(card);
            });
        });
    }

    createCardHTML(card) {
        const formattedDate = this.formatDate(card.date);
        const categoryColor = this.getCategoryColor(card.category);
        
        return `
            <div class="card" data-id="${card.id}">
                <div class="card-header" style="background: ${categoryColor}">
                    <div class="card-category">${card.category}</div>
                    <h3 class="card-title">${card.title}</h3>
                    <div class="card-date">📅 ${formattedDate}</div>
                </div>
                <div class="card-body">
                    <p class="card-description">${card.description}</p>
                    <div class="card-footer">
                        <a href="#" class="read-more">
                            자세히 보기 
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 17L17 7M17 7H7M17 7V17"/>
                            </svg>
                        </a>
                        <div class="card-stats">
                            <span>👁️ ${card.views || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getCategoryColor(category) {
        const colors = {
            '재건축': 'linear-gradient(135deg, #3498db, #5dade2)',
            '공지사항': 'linear-gradient(135deg, #e74c3c, #ec7063)',
            '알아두기': 'linear-gradient(135deg, #f39c12, #f7dc6f)',
            'FAQ': 'linear-gradient(135deg, #27ae60, #58d68d)',
            'default': 'linear-gradient(135deg, #6c5ce7, #a29bfe)'
        };
        return colors[category] || colors.default;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        const totalPages = Math.ceil(this.filteredCards.length / this.cardsPerPage);
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';
        
        let paginationHTML = '';
        
        // 이전 페이지 버튼
        paginationHTML += `
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="cardManager.changePage(${this.currentPage - 1})">
                ◀
            </button>
        `;
        
        // 페이지 번호들
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="cardManager.changePage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span style="padding: 10px; color: white;">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="cardManager.changePage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span style="padding: 10px; color: white;">...</span>`;
            }
            paginationHTML += `<button class="page-btn" onclick="cardManager.changePage(${totalPages})">${totalPages}</button>`;
        }
        
        // 다음 페이지 버튼
        paginationHTML += `
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="cardManager.changePage(${this.currentPage + 1})">
                ▶
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    changePage(pageNumber) {
        if (pageNumber < 1 || pageNumber > Math.ceil(this.filteredCards.length / this.cardsPerPage)) {
            return;
        }
        
        this.currentPage = pageNumber;
        this.renderCards();
        this.renderPagination();
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    openCardNews(card) {
        // 조회수 증가 (실제로는 서버에서 처리해야 함)
        card.views = (card.views || 0) + 1;
        
        // 카드뉴스 페이지로 이동
        window.open(card.filename, '_blank');
    }

    // 관리자 기능: 새 카드뉴스 추가
    addCardNews(cardData) {
        const newCard = {
            id: `card-${Date.now()}`,
            title: cardData.title,
            description: cardData.description,
            category: cardData.category,
            date: new Date().toISOString().split('T')[0],
            filename: cardData.filename,
            views: 0,
            thumbnail: cardData.thumbnail || null
        };
        
        this.allCards.unshift(newCard);
        this.applyFilters();
        
        console.log('새 카드뉴스가 추가되었습니다:', newCard);
    }
}

// 페이지 로드 시 초기화
let cardManager;
document.addEventListener('DOMContentLoaded', () => {
    cardManager = new CardNewsManager();
});

// 전역 함수들 (HTML에서 호출용)
function changePage(pageNumber) {
    if (cardManager) {
        cardManager.changePage(pageNumber);
    }
}