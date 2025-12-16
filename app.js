// app.js - logic đơn giản cho cửa hàng mẫu
(function(){
  const products = [
    {id:1,name:'Áo thun cotton',price:199000,image:'https://via.placeholder.com/400x300?text=Ao+thun'},
    {id:2,name:'Quần jean',price:349000,image:'https://via.placeholder.com/400x300?text=Quan+jean'},
    {id:3,name:'Giày thể thao',price:799000,image:'https://via.placeholder.com/400x300?text=Giay'},
    {id:4,name:'Mũ lưỡi trai',price:99000,image:'https://via.placeholder.com/400x300?text=Mu'},
    {id:5,name:'Túi đeo chéo',price:249000,image:'https://via.placeholder.com/400x300?text=Tui'},
    {id:6,name:'Áo khoác',price:499000,image:'https://via.placeholder.com/400x300?text=Ao+khoac'}
  ];

  const $products = document.getElementById('products');
  const $cartBtn = document.getElementById('cart-btn');
  const $cartCount = document.getElementById('cart-count');
  const $cartModal = document.getElementById('cart-modal');
  const $closeCart = document.getElementById('close-cart');
  const $cartItems = document.getElementById('cart-items');
  const $cartTotal = document.getElementById('cart-total');
  const $checkout = document.getElementById('checkout');
  const $searchInput = document.getElementById('search-input');
  const $authBtn = document.getElementById('auth-btn');
  const $authModal = document.getElementById('auth-modal');
  const $closeAuth = document.getElementById('close-auth');
  const $loginForm = document.getElementById('login-form');
  const $registerForm = document.getElementById('register-form');
  const $showRegister = document.getElementById('show-register');
  const $showLogin = document.getElementById('show-login');
  const $profileView = document.getElementById('profile-view');
  const $profileName = document.getElementById('profile-name');
  const $profileEmail = document.getElementById('profile-email');
  const $btnLogout = document.getElementById('btn-logout');
  const $btnCloseProfile = document.getElementById('btn-close-profile');
  const $skipAuth = document.getElementById('skip-auth');

  let users = loadUsers();
  let currentUser = loadCurrentUser();

  let cart = loadCart();

  function formatVND(n){
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',') + ' đ';
  }

  function renderProducts(query){
    const q = (query || '').toString().trim().toLowerCase();
    const list = q ? products.filter(p => (p.name || '').toLowerCase().includes(q) || p.id.toString().includes(q)) : products;
    $products.innerHTML = '';
    list.forEach(p=>{
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <div class="muted">Mã: ${p.id}</div>
        <div class="price">${formatVND(p.price)}</div>
        <div class="actions">
          <button class="btn" data-add="${p.id}">Thêm vào giỏ</button>
        </div>
      `;
      $products.appendChild(el);
    });
  }

  function debounce(fn,wait){
    let t;
    return function(...args){
      clearTimeout(t);
      t = setTimeout(()=>fn.apply(this,args), wait);
    };
  }

  function onAddClick(e){
    const id = e.target.getAttribute('data-add');
    if(!id) return;
    const pid = Number(id);
    const prod = products.find(x=>x.id===pid);
    if(!prod) return;
    addToCart(prod);
  }

  function addToCart(product){
    const idx = cart.findIndex(i=>i.id===product.id);
    if(idx===-1) cart.push({id:product.id,name:product.name,price:product.price,qty:1,image:product.image});
    else cart[idx].qty += 1;
    saveCart();
    renderCart();
  }

  function removeFromCart(id){
    cart = cart.filter(i=>i.id!==id);
    saveCart();
    renderCart();
  }

  function changeQty(id,delta){
    const item = cart.find(i=>i.id===id);
    if(!item) return;
    item.qty += delta;
    if(item.qty<=0) removeFromCart(id);
    saveCart();
    renderCart();
  }

  function renderCart(){
    $cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(it=>{
      total += it.price * it.qty;
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${it.image}" alt="${it.name}">
        <div style="flex:1">
          <div><strong>${it.name}</strong></div>
          <div class="muted">${formatVND(it.price)} x ${it.qty}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div>
            <button class="btn small" data-minus="${it.id}">-</button>
            <button class="btn small" data-plus="${it.id}">+</button>
          </div>
          <button class="btn" data-remove="${it.id}">Xóa</button>
        </div>
      `;
      $cartItems.appendChild(li);
    });
    $cartTotal.textContent = formatVND(total);
    $cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);

    // events for cart controls
    $cartItems.querySelectorAll('[data-remove]').forEach(btn=>btn.onclick = ()=> removeFromCart(Number(btn.getAttribute('data-remove'))));
    $cartItems.querySelectorAll('[data-plus]').forEach(btn=>btn.onclick = ()=> changeQty(Number(btn.getAttribute('data-plus')),1));
    $cartItems.querySelectorAll('[data-minus]').forEach(btn=>btn.onclick = ()=> changeQty(Number(btn.getAttribute('data-minus')), -1));
  }

  function saveCart(){
    localStorage.setItem('simple-cart', JSON.stringify(cart));
  }

  function loadCart(){
    try{const s = localStorage.getItem('simple-cart'); return s?JSON.parse(s):[];}catch(e){return []}
  }

  // UI events
  $cartBtn.addEventListener('click', ()=>{ $cartModal.classList.remove('hidden'); });
  $closeCart.addEventListener('click', ()=>{ $cartModal.classList.add('hidden'); });
  $cartModal.addEventListener('click', (e)=>{ if(e.target===$cartModal) $cartModal.classList.add('hidden'); });
  $checkout.addEventListener('click', ()=>{
    if(cart.length===0){ alert('Giỏ hàng đang rỗng.'); return; }
    const total = cart.reduce((s,i)=>s + i.price*i.qty,0);
    alert('Thanh toán thành công — tổng: ' + formatVND(total) + '\n(Cảm ơn bạn!)');
    cart = [];
    saveCart();
    renderCart();
    $cartModal.classList.add('hidden');
  });

  // Auth helpers
  function loadUsers(){
    try{const s = localStorage.getItem('simple-users'); return s?JSON.parse(s):[];}catch(e){return[]}
  }
  function saveUsers(){ localStorage.setItem('simple-users', JSON.stringify(users)); }
  function loadCurrentUser(){ try{const s = localStorage.getItem('simple-current-user'); return s?JSON.parse(s):null;}catch(e){return null} }
  function saveCurrentUser(u){ if(u) localStorage.setItem('simple-current-user', JSON.stringify(u)); else localStorage.removeItem('simple-current-user'); }

  function showAuthModal(mode){
    // mode: 'login' | 'register' | 'profile'
    $authModal.classList.remove('hidden');
    document.getElementById('auth-title').textContent = mode==='register' ? 'Đăng ký' : mode==='profile' ? 'Tài khoản' : 'Đăng nhập';
    if(mode==='register'){
      $registerForm.classList.remove('hidden'); $loginForm.classList.add('hidden'); $profileView.classList.add('hidden');
    } else if(mode==='profile'){
      $registerForm.classList.add('hidden'); $loginForm.classList.add('hidden'); $profileView.classList.remove('hidden');
    } else {
      $registerForm.classList.add('hidden'); $loginForm.classList.remove('hidden'); $profileView.classList.add('hidden');
    }
  }

  function hideAuthModal(){ $authModal.classList.add('hidden'); }

  function registerUser(name,email,password){
    email = (email||'').trim().toLowerCase();
    if(!name || !email || !password) return {ok:false,msg:'Vui lòng nhập đầy đủ thông tin.'};
    if(users.find(u=>u.email===email)) return {ok:false,msg:'Email đã được sử dụng.'};
    const id = Date.now();
    const user = {id,name,email,password};
    users.push(user); saveUsers();
    return {ok:true,user};
  }

  function loginUser(email,password){
    email = (email||'').trim().toLowerCase();
    const user = users.find(u=>u.email===email && u.password===password);
    if(!user) return {ok:false,msg:'Email hoặc mật khẩu không đúng.'};
    return {ok:true,user};
  }

  function logout(){ currentUser = null; saveCurrentUser(null); renderAuthState(); }

  function renderAuthState(){
    if(currentUser){
      $authBtn.textContent = 'Xin chào, ' + (currentUser.name || currentUser.email.split('@')[0]);
    } else {
      $authBtn.textContent = 'Đăng nhập';
    }
  }

  // auth UI events
  if($authBtn) $authBtn.addEventListener('click', (e)=>{
    // If user is logged in, prevent navigation and show profile modal.
    // If not logged in, allow default link navigation to `log_in.html`.
    if(currentUser){
      e.preventDefault();
      showAuthModal('profile');
      updateProfileView();
    }
  });
  if($closeAuth) $closeAuth.addEventListener('click', hideAuthModal);
  if($authModal) $authModal.addEventListener('click', (e)=>{ if(e.target===$authModal) hideAuthModal(); });

  // skip auth persistence
  function loadSkipAuth(){ try{ const s = localStorage.getItem('simple-skip-auth'); return s === '1'; }catch(e){return false} }
  function saveSkipAuth(v){ try{ if(v) localStorage.setItem('simple-skip-auth','1'); else localStorage.removeItem('simple-skip-auth'); }catch(e){} }

  if($skipAuth) $skipAuth.addEventListener('click', ()=>{ saveSkipAuth(true); hideAuthModal(); });

  if($showRegister) $showRegister.addEventListener('click', ()=> showAuthModal('register'));
  if($showLogin) $showLogin.addEventListener('click', ()=> showAuthModal('login'));

  if($loginForm) $loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const res = loginUser(email,pass);
    if(!res.ok) { alert(res.msg); return; }
    currentUser = res.user; saveCurrentUser(currentUser); renderAuthState(); hideAuthModal();
  });

  if($registerForm) $registerForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    if(pass.length < 4){ alert('Mật khẩu phải >= 4 ký tự'); return; }
    const res = registerUser(name,email,pass);
    if(!res.ok){ alert(res.msg); return; }
    currentUser = res.user; saveCurrentUser(currentUser); renderAuthState(); hideAuthModal();
  });

  if($btnLogout) $btnLogout.addEventListener('click', ()=>{ logout(); hideAuthModal(); });
  if($btnCloseProfile) $btnCloseProfile.addEventListener('click', hideAuthModal);

  // show profile details when opening profile view
  function updateProfileView(){ if(currentUser){ $profileName.textContent = currentUser.name || ''; $profileEmail.textContent = currentUser.email || ''; } }

  // initialize auth state
  renderAuthState(); updateProfileView();

  // show auth modal on first load if not logged in and not skipped
  if(!currentUser && !loadSkipAuth()){
    // open as login by default
    showAuthModal('login');
  }

  // attach product click handler once
  $products.addEventListener('click', onAddClick);

  // search input handling (debounced)
  if($searchInput){
    $searchInput.addEventListener('input', debounce(e=> renderProducts(e.target.value), 200));
  }

  // init
  renderProducts();
  renderCart();

})();
