/**
 * Класс CreateAccountForm управляет формой
 * создания нового счёта
 * */
class CreateAccountForm extends AsyncForm {
  /**
   * Создаёт счёт с помощью Account.create и закрывает
   * окно в случае успеха, а также вызывает App.update()
   * и сбрасывает форму
   * */
  onSubmit(data) {
    let callback = () => {
      App.getModal('createAccount').close();
      App.update();
      this.element.reset();
    }
    Account.create(data, callback);
  }
}
