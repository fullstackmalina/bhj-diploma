/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor(element) {
    if (!element) {
      throw new Error('Элемент не должен быть пустым!');
    }
    this.element = element;
    this.registerEvents();
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    if (this.lastOptions) {
      this.render(this.lastOptions);
    }
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    document.querySelector('.remove-account').onclick = () => {
      this.removeAccount();
    }
    document.querySelector('.content').onclick = () => {
      if (event.target.classList.contains('transaction__remove')) {
        this.removeTransaction(event.target.dataset['id']);
      }
      else {
        if (event.target.closest('.transaction__remove')) {
          this.removeTransaction(event.target.closest('.transaction__remove').dataset['id']);
        }
      }
    };
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets(),
   * либо обновляйте только виджет со счетами
   * для обновления приложения
   * */
  removeAccount() {
    if (this.lastOptions) {
      let question = confirm('Вы действительно хотите удалить этот счет?');
      if (question) {
        let callback = (error, response) => {
          if (!error) {
            App.updateWidgets();
          }
        };
        Account.remove({ id: this.lastOptions.account_id }, callback);
      }
    }
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */f
  removeTransaction(id) {
    let question = confirm('Вы действительно хотите удалить эту транзакцию?');
    if (question) {
      let callback = (error, response) => {
        if (!error) {
          App.update();
        }
      };
      Transaction.remove({ id }, callback);
    }
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options) {
    //  this.clear();
    this.lastOptions = options;
    let callback = (error, response) => {
      if (!error) {
        this.renderTitle(response.data.name);
      }
    };
    Account.get(options.account_id, callback);
    let user = User.current();
    if (user) {
      let data = { mail: user.email, account_id: options.account_id };
      let callback2 = (error, response) => {
        this.renderTransactions(response.data);
      };
      Transaction.list(data, callback2);
    }
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    this.renderTransactions([]);
    this.renderTitle('Название счета');
    this.lastOptions = null;
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name) {
    document.querySelector('.content-title').textContent = name;
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date) {
    let newDate = new Date(date);
    let month = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа',
      'сентября', 'октября', 'ноября', 'декабря'];
    let strdate = newDate.getDate() + ' ' + month[newDate.getMonth()] + ' ' +
      newDate.getFullYear() + 'г. в ' + newDate.getHours() + ':' + newDate.getMinutes();
    return strdate;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item) {
    let date = this.formatDate(item.created_at);
    let type = (item.type == 'income') ? 'transaction_income' : 'transaction_expense';
    return `<div class="transaction ${type} row">
        <div class="col-md-7 transaction__details">
          <div class="transaction__icon">
              <span class="fa fa-money fa-2x"></span>
          </div>
          <div class="transaction__info">
              <h4 class="transaction__title">${item.name}</h4>
              <!-- дата -->
              <div class="transaction__date">${date}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="transaction__summ">${item.sum}<span class="currency">₽</span>
          </div>
        </div>
        <div class="col-md-2 transaction__controls">
            <!-- в data-id нужно поместить id -->
            <button class="btn btn-danger transaction__remove" data-id="${item.id}">
                <i class="fa fa-trash"></i>  
            </button>
        </div>
    </div>`
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data) {
    let obj = document.querySelector('.content');
    obj.innerHTML = '';
    for (let item of data) {
      let trans = this.getTransactionHTML(item);
      let div = document.createElement('div');
      div.innerHTML = trans;
      obj.appendChild(div.firstChild);
    }
  }
}