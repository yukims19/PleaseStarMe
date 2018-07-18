import React, { Component } from 'react';
import repoicon from './img/repo.png';
import './App.css';

class Link extends Component{
    render(){
        return(
                <div className="link">
                <div className="input-group mb-3">
                <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon3">https://pleasestarme.com/?query=</span>
                </div>
                <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3" />
                <div className="input-group-append">
                <button className="btn btn-primary" type="button" id="button-addon2">Copy Link to Share</button>
                </div>
                </div>

            </div>
        )
    }
}

class Repo extends Component{
    render(){
        return(
                <div className="repo">
                <h5>Generate a link to get stars for your repos:</h5>
                <div className="input-group repo-input">
                <input type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="button-addon2"/>
                <div className="input-group-append">
                <button className="btn btn-secondary" type="button" id="button-addon2">Add Star Wanted Repo</button>
                </div>
                </div>
                <div className="added-repo">
                <ul>
                <li><i className="fas fa-times"></i> <img src={repoicon}/> yukims19 / OneProfile</li>
                </ul>

                </div>
                </div>
        )
    }
}

class App extends Component {
  render() {
    return (
            <div className="App">
            <div className="header">
            <img src="./public/favicon.io" />
            <div className="username">
            sgrove <br/>@OneGraph
            </div>
            <i className="fas fa-chevron-down"></i>
            </div>
            <div className="container">
            <Link />
            <Repo />
            </div>
      </div>
    );
  }
}

export default App;
