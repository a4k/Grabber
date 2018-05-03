

class App extends React.Component {
    constructor(props) {
        super(props);
        this.handleSearch = this.handleSearch.bind(this); // Кнопка поиска
        this.handleChangeText = this.handleChangeText.bind(this);
        this.state = {
            q: '',
            res: false,
            canWrite: true, // может ли писать
        };
        // $('body').append('test');
    }

    handleChangeText(e) {
        // Пользователь печатает
        if(this.state.canWrite) {
            this.setState({
                q: e.target.value,
            });
        }

    }

    handleSearch(e) {
        // Пользователь начинает поиск по фразе
        // this.props.onSubmit(this.state.q);
        let $this = this;

        e.preventDefault();
        if(this.state.q) {
            let search_text = this.state.q;
            this.setState({
                canWrite: false,
                q: '',
            });
            setTimeout(this.startTimer.bind(this, 5000), 1000);
            $.ajax({
                method: 'post',
                url: 'search',
                data: {
                    search_text: search_text,
                },
            }).done((data) => {
                console.log(data);
                if(data.type === 'success') {
                    // Данные успешно загружены в базу данных
                    $this.setState({
                        res: 'Данные успешно загружены в базу данных',
                    })
                } else {
                    $this.setState({
                        res: 'Возникла ошибка',
                    })
                }

            });

        }

    }

    startTimer(time) {
        // таймер обратного отсчета
        time -= 1000;

        console.log('ss : ' + this.state.canWrite);
        if(time === 0) {
            this.setState({
                canWrite: true,
            })
        } else {
            // Отсчет не закончен, пользователь не может писать
            this.setState({
                canWrite: false,
                q: '',
            });
            setTimeout(this.startTimer.bind(this, time), 1000);
        }
    }
    render() {
        let res,
            classBtn = 'search_btn btn btn-primary' + ((this.state.canWrite) ? '' : ' noactive');
        if(this.state.res) {
            res = (
                <div className="container">
                    <h2>{this.state.q}</h2>
                    <div className="results">
                        {this.state.res}
                    </div>
                </div>
            );
        }
        return (
            <div className="main">
                <div className="jumbotron jumbotron-fluid">
                    <div className="container">
                        <h1 className="display-4">Анализ социального мнения</h1>
                        <p className="lead">Поиск осуществляется по соц. сетям</p>
                    </div>
                    <div className="container">
                        <form onSubmit={this.handleSearch} className="search">
                            <input type="text" className="search_input form-control"
                                   onKeyUp={this.handleChangeText}
                                   placeholder="Введите фразу для поиска.." autoFocus="autoFocus" />
                            <button onClick={this.handleSearch} className={classBtn}>Поиск</button>
                        </form>
                    </div>
                </div>
                <div className="posts">
                    {res}
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root'));