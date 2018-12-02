const React = require('react');

class UserList extends React.Component{
  constructor() {
    super();
    this.state = {
      isMounted: false,
      userList: null,
      data: null,
      list: {
        open: false
      }
    }
  }

  toggleClass(e) {
    if(e.currentTarget.classList.contains('is-open')){
      e.currentTarget.classList.remove('is-open');
    }else{
      for(let i = 0; i < document.querySelectorAll('.p-card').length; i++){
        document.querySelectorAll('.p-card')[i].classList.remove('is-open');
      }
      e.currentTarget.classList.add('is-open')
    }
  }

  componentDidMount() {
    if(this.props.isMounted === true){
      console.log(this.props.userData);
      this.setState({
        isMounted: true
      })
    }
  }

  render() {
    if(this.state.isMounted === false){
      return (
        <ul className={'list'} key="nowLoading">
          <p>Now Loading...</p>
        </ul>
      )
    }else{

      let list = [];
      for(let i in this.props.userData){
        let figureStyle = {
          background: `url(${this.props.userData[i].value.items[0].snippet.thumbnails.high.url}) no-repeat center top`,
          backgroundSize: 'cover',
        };
        list.push(
          <li key={i}>
            <div className="p-card" data-channel-id={this.props.userData[i].value.items[0].id} data-user-belong={this.props.userData[i].belong} onClick={this.toggleClass.bind(this)}>
              <div className="p-card__inner--img">
                <figure className="p-card__img" style={figureStyle}></figure>
              </div>
              <div className="p-card__inner--data">

              </div>
            </div>
          </li>);
      }
      return (
        <ul className="p-userList" key="userList">
          {list}
        </ul>
      );
    }
  }
}

module.exports = UserList;