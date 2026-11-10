// ---------- Academic Planner ----------
const taskForm = document.getElementById('taskForm');
if (taskForm) {
  const input = document.getElementById('taskInput');
  const list = document.getElementById('taskList');
  const count = document.getElementById('count');
  let tasks = [];                                   // array of {id, text, done}
  try { tasks = JSON.parse(localStorage.getItem('tasks')) || []; } catch (e) { tasks = []; }

  function save() { try { localStorage.setItem('tasks', JSON.stringify(tasks)); } catch (e) {} }

  function render() {                               // rebuilds the list from the array
    list.innerHTML = '';
    tasks.forEach(function (task) {
      const li = document.createElement('li');
      if (task.done) li.classList.add('done');
      const box = document.createElement('input');
      box.type = 'checkbox'; box.checked = task.done;
      box.setAttribute('aria-label', 'Mark "' + task.text + '" as completed');
      box.addEventListener('change', function () { toggleTask(task.id); });
      const span = document.createElement('span'); span.textContent = task.text;
      const del = document.createElement('button');
      del.className = 'del'; del.textContent = 'Delete';
      del.addEventListener('click', function () { li.classList.add('leaving'); setTimeout(function () { deleteTask(task.id); }, 280); });
      li.append(box, span, del); list.appendChild(li);
    });
    const left = tasks.filter(function (t) { return !t.done; }).length;
    count.textContent = tasks.length ? left + ' of ' + tasks.length + ' tasks left' : 'No tasks yet. Add your first one above.';
  }
  function addTask(text) { tasks.push({ id: Date.now(), text: text, done: false }); save(); render(); }
  function toggleTask(id) { tasks = tasks.map(function (t) { return t.id === id ? { id: t.id, text: t.text, done: !t.done } : t; }); save(); render(); }
  function deleteTask(id) { tasks = tasks.filter(function (t) { return t.id !== id; }); save(); render(); }

  taskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (text === '') return;
    addTask(text); input.value = ''; input.focus();
  });
  render();
}

// ---------- Contact form validation ----------
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  function showError(field, msg) {
    document.getElementById(field.id + 'Err').textContent = msg;
    field.classList.toggle('bad', msg !== '');
    return msg === '';
  }
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isDigitsOnly(v) { return /^\d+$/.test(v); }

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name'), email = document.getElementById('email'),
          phone = document.getElementById('phone'), message = document.getElementById('message');
    const results = [
      showError(name, name.value.trim() === '' ? 'Enter your name.' : ''),
      showError(email, email.value.trim() === '' ? 'Enter your email address.' :
                       !isValidEmail(email.value.trim()) ? 'Enter a valid email, like name@example.com.' : ''),
      showError(phone, phone.value.trim() === '' ? 'Enter your phone number.' :
                       !isDigitsOnly(phone.value.trim()) ? 'Use digits only, with no spaces or symbols.' : ''),
      showError(message, message.value.trim() === '' ? 'Write a message.' : '')
    ];
    const result = document.getElementById('result');
    if (!results.every(Boolean)) { contactForm.classList.remove('shake'); void contactForm.offsetWidth; contactForm.classList.add('shake'); }
    if (results.every(Boolean)) {
      result.innerHTML = '<p class="ok">Thanks, ' + name.value.trim().replace(/</g, '&lt;') + '. Your message was received.</p>';
      contactForm.reset();
    } else { result.innerHTML = ''; }
  });
}
