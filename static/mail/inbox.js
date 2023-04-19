document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', submit_email);

  // If an email was sent then load sent mailbox
  if (!localStorage.getItem('email_sent')) {
    load_mailbox('inbox');
  } else {
    load_mailbox('sent')
    localStorage.removeItem('email_sent')
  }
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none'
  document.querySelector('.card-footer').style.display = "block"

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load the appropriate mailbox
  if (mailbox === 'inbox') {
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {

      view = document.querySelector('#emails-view')

      view.innerHTML = `
      <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
      <table class="table mt-4">
      <thead>
      <tr>
      <th>Subject</th><th>Date/Time</th><th>Sender</th>
      </tr>
      </thead>
      <tbody class="t-body">
      </tbody>
      </table>`

      // Get table body
      const body = document.querySelector('.t-body')

      for (i = 0; i < emails.length; i++) {
        // Create row
        let row = document.createElement('tr')

        // Set cursor to pointer for better UX
        row.style.cursor = "pointer"

        // Add border and reference class to row
        row.classList.add("border")
        row.classList.add("t-row")

        // Add email ID to row
        row.id = emails[i].id

        // Set row to active if email read
        if (!emails[i].read == false) {
          row.classList.add("table-active")
        }

        // Create Subject table data
        let subject = document.createElement('td');
        subject.innerHTML = `<div>${emails[i].subject}</div>`
        row.append(subject)

        // Create Timestamp table data
        let timestamp = document.createElement('td')
        timestamp.innerHTML = `<div>${emails[i].timestamp}</div>`
        row.append(timestamp)

        // Create Sender table data
        let sender = document.createElement('td');
        sender.innerHTML = `<div>${emails[i].sender}</div>`;     
        row.append(sender);

        // Append row to table body
        body.append(row)

        // Add Eventlistener to row to open selected email on click
        row.addEventListener('click', () => {
          fetch(`emails/${row.id}`)
          .then(response => response.json())
          .then(email => {
            // Hide mailbox and show content of selected email
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#view-email').style.display = 'block';

            // Set email to 'read' when opening
            fetch(`emails/${row.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                read: true
              })
            })

            // Display email content in card (if email archived, change button)
            document.querySelector('.card-header').innerHTML = `From: ${email.sender}<br><button class="btn btn-outline-secondary btn-sm" id="reply-btn">Reply</button>`
            document.querySelector('.card-title').innerHTML = email.subject
            document.querySelector('.card-text').innerHTML = email.body
            document.querySelector('.card-footer').innerHTML = `Recipients: ${email.recipients}`


            // Add option to archive email
            if (!email.archived) {

              document.querySelector('.card-subtitle').innerHTML = `<button id="archive-btn" class="btn btn-outline-secondary btn-sm mb-3 mt-2">Archive</button> <strong>${email.timestamp}</strong>`
              document.querySelector('#archive-btn').addEventListener('click', () => {
                fetch(`emails/${row.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    archived: true
                  })
                })
                // Refresh page and load inbox after archiving email
                document.querySelector('#refresh').submit()
              })  
            }

            // Add option to reply to an email
            document.querySelector('#reply-btn').addEventListener('click', () => {

              // Call compose email view
              compose_email()

              // Pre-fill composition fields
              document.querySelector('#compose-recipients').value = email.sender;
              document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
              document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
            })
          })
        })
      }
    })
  }
  if (mailbox === 'archive') {
    fetch('emails/archive')
    .then(response => response.json())
    .then(emails => {

      view = document.querySelector('#emails-view')

      view.innerHTML = `
      <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
      <table class="table mt-4">
      <thead>
      <tr>
      <th>Subject</th><th>Date/Time</th><th>Sender</th>
      </tr>
      </thead>
      <tbody class="t-body">
      </tbody>
      </table>`

      // Get table body
      const body = document.querySelector('.t-body')

      for (i = 0; i < emails.length; i++) {
        // Create row
        let row = document.createElement('tr')

        // Set cursor to pointer for better UX
        row.style.cursor = "pointer"

        // Add border and reference class to row
        row.classList.add("border")
        row.classList.add("t-row")

        // Add email ID to row
        row.id = emails[i].id

        // Create Subject table data
        let subject = document.createElement('td');
        subject.innerHTML = `<div>${emails[i].subject}</div>`
        row.append(subject)

        // Create Timestamp table data
        let timestamp = document.createElement('td')
        timestamp.innerHTML = `<div>${emails[i].timestamp}</div>`
        row.append(timestamp)

        // Create Sender table data
        let sender = document.createElement('td');
        sender.innerHTML = `<div>${emails[i].sender}</div>`;     
        row.append(sender);

        // Append row to table body
        body.append(row)

        // Add Eventlistener to row to open selected email on click
        row.addEventListener('click', () => {
          fetch(`emails/${row.id}`)
          .then(response => response.json())
          .then(email => {
            // Hide mailbox and show content of selected email
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#view-email').style.display = 'block';


            // Display email content in card (if email archived, change button)
            document.querySelector('.card-header').innerHTML = `From: ${email.sender}<br><button class="btn btn-outline-secondary btn-sm" id="reply-btn">Reply</button>`
            document.querySelector('.card-title').innerHTML = email.subject
            document.querySelector('.card-text').innerHTML = email.body
            document.querySelector('.card-footer').innerHTML = `Recipients: ${email.recipients}`

            // Add option to unarchive email
            if (email.archived) {

              document.querySelector('.card-subtitle').innerHTML = `<button id="archive-btn" class="btn btn-outline-secondary btn-sm mb-3">Unarchive</button><br><strong>${email.timestamp}</strong>`
              document.querySelector('#archive-btn').addEventListener('click', () => {
                fetch(`emails/${row.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    archived: false
                  })
                })
                // Refresh page and load Archive mailbox after unarchiving email
                document.querySelector('#refresh').submit()
              })  
            }

            // Add option to reply to an email
            document.querySelector('#reply-btn').addEventListener('click', () => {

              // Call compose email view
              compose_email()

              // Pre-fill composition fields
              document.querySelector('#compose-recipients').value = email.sender;
              document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
              document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
            })
          })
        })
      }
    })
  }

  if (mailbox == 'sent') {

    fetch('emails/sent')
    .then(response => response.json())
    .then(emails => {

      view = document.querySelector('#emails-view')

      view.innerHTML = `
      <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
      <table class="table mt-4">
      <thead>
      <tr>
      <th>Subject</th><th>Date/Time</th><th>Sender</th>
      </tr>
      </thead>
      <tbody class="t-body">
      </tbody>
      </table>`

      // Get table body
      const body = document.querySelector('.t-body')

      for (i = 0; i < emails.length; i++) {
        // Create row
        let row = document.createElement('tr')

        // Set cursor to pointer for better UX
        row.style.cursor = "pointer"

        // Add border and reference class to row
        row.classList.add("border")
        row.classList.add("t-row")

        // Add email ID to row
        row.id = emails[i].id

        // Create Subject table data
        let subject = document.createElement('td');
        subject.innerHTML = `<div>${emails[i].subject}</div>`
        row.append(subject)

        // Create Timestamp table data
        let timestamp = document.createElement('td')
        timestamp.innerHTML = `<div>${emails[i].timestamp}</div>`
        row.append(timestamp)

        // Create Sender table data
        let sender = document.createElement('td');
        sender.innerHTML = `<div>Me</div>`;     
        row.append(sender);

        // Append row to table body
        body.append(row)

        // Add Eventlistener to row to open selected email on click
        row.addEventListener('click', () => {
          fetch(`emails/${row.id}`)
          .then(response => response.json())
          .then(email => {
            // Hide mailbox and show content of selected email
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#view-email').style.display = 'block';


            // Display email content in card (if email archived, change button)
            document.querySelector('.card-header').innerHTML = `To: ${email.recipients}`
            document.querySelector('.card-title').innerHTML = email.subject
            document.querySelector('.card-text').innerHTML = email.body
            document.querySelector('.card-footer').style.display = "none"

          })
        })
      }
    })
  }
}       

function submit_email() {

  // Fetch email recipient, subject and content
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const content = document.querySelector('#compose-body').value;

  // Fetch API and send post request
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipient,
      subject: subject,
      body: content
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
  })

  // Set variable in localstorage to indicate that an email was sent
  if (!localStorage.getItem('email_sent')) {
    localStorage.setItem('email_sent', true)
  } else {
    localStorage.setItem('email_sent', true)
  }
}
