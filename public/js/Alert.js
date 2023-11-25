const hideAlert = () => {
  const alert = document.querySelector('.alert')
    if(alert)alert.parentElement.removeChild(alert)

}

export const showAlert = (type,msg,time=7) => {
  hideAlert()
  const alert = `<div class='alert alert--${type}'>${msg}<div>`;

  document.querySelector('body').insertAdjacentHTML('afterbegin', alert)
  
  setTimeout(hideAlert,time*1000)
}