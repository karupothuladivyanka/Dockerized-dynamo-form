const form = document.getElementById('dataForm');
const message = document.getElementById('message');
const contactList = document.getElementById('contactList');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form); // collects all inputs + file

  try {
    const res = await fetch('/submit', {
      method: 'POST',
      body: formData
    });

    const text = await res.text();

    message.textContent = text;
    message.style.color = res.ok ? 'green' : 'red';

    form.reset();
    if (res.ok) {
      await loadContacts();
    }
    
  } catch (err) {
    console.error(err);
    message.textContent = 'An error occurred';
    message.style.color = 'red';
  }
});

async function loadContacts() {
  contactList.innerHTML = '';
  try {
    const res = await fetch('/contacts');
    const contacts = await res.json();

    if (!contacts.length) {
      contactList.innerHTML = '<li>No contacts yet</li>';
      return;
    }

    contacts.forEach((contact) => {
      const li = document.createElement('li');
      li.textContent = `${contact.name} - ${contact.email} - ${contact.phone}`;

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => deleteContact(contact.id));

      li.appendChild(document.createTextNode(' '));
      li.appendChild(delBtn);
      contactList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    contactList.innerHTML = '<li>Error loading contacts</li>';
  }
}

async function deleteContact(id) {
  try {
    const res = await fetch(`/contacts/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      throw new Error('Delete failed');
    }
    await loadContacts();
  } catch (err) {
    console.error(err);
    message.textContent = 'Error deleting contact';
    message.style.color = 'red';
  }
}

// Load list on page load
loadContacts();
