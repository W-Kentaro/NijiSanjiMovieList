const React = require('react');

class UserList extends React.Component {
  constructor() {
    super();
    this.state = {
      isMounted: false,
      userList: [],
      data: []
    }
  }

  componentDidMount() {
    if (this.props.isMounted === true) {
      console.log(this.props.userData);
      this.setState({
        isMounted: true
      })
    }
  }

  render() {
    if (this.state.isMounted === false) {
      return (
        <ul className={'list'} key='nowLoading'>
          <p>Now Loading...</p>
        </ul>
      )
    } else {

      let list = [];

      for (let i in this.props.userData) {
        list.push(
          <li data-channel-id={this.props.userData[i].items[0].id} key={i}>
            <img src={this.props.userData[i].items[0].snippet.thumbnails.high.url} alt=""/>
          </li>);
      }
      return (
        <ul className={'list'} key='userList'>
          {list}
        </ul>
      );
    }
  }
}

module.exports = UserList;