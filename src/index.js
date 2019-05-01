import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import './index.css';

class Beverages extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            allBeverages : [],
            allOptions : null,
            namesLookup : [],
        };
    }


    componentDidMount() {

        var url = `http://caffein8.test/favorites`;

        // Arrow functions don't create new functional context and use context of a calling function.
        // So here 'this' is really the parent this, therefore our component
        axios.get(url)
            .then((result) => {
                console.log(result);
                let allBeverages = [];
                let namesLookup = {};

                if ( !result.data.success ) {
                    return;
                }

                result.data.data.forEach(beverage => {
                    allBeverages.push({
                        name			: beverage.name,
                        caffeine_mg		: beverage.caffeine_mg,
                        qty				: 0,
                    });
                    namesLookup[beverage.id] = beverage.name;
                });
                this.setState({allBeverages});
                this.setState({namesLookup});
            });
    }

    getOptions() {
        var url = `http://caffein8.test/options`;

        axios.post(url,
            {
                consumption : this.state.allBeverages.reduce((accumulator, beverage) => {
                    return accumulator + (beverage.qty * parseInt(beverage.caffeine_mg));
                }, 0)
            })
            .then((result) => {

                if (result.data.success) {
                    let allOptions = [];
                    result.data.data.forEach(combination => {
                        allOptions.push(combination)
                    });
                    this.setState({allOptions});
                }
                else {
                    this.setState({allOptions : []});
                }
            });
    }

    addOne(index) {

        const clone = this.state.allBeverages.slice()
        clone[index].qty++;
        this.setState({allBeverages: clone})

        this.getOptions();
    }


    subtractOne(index) {

        if (this.state.allBeverages[index].qty <= 0) {
            return;
        }
        const clone = this.state.allBeverages.slice()
        clone[index].qty--;
        this.setState({allBeverages: clone})

        this.getOptions();
    }


    render() {

        let rows = this.state.allBeverages.map((beverage, i) =>
            <tr key={i}>
                <td>{beverage.name}</td>
                <td>{beverage.caffeine_mg}mg</td>
                <td>{beverage.qty}</td>
                <td><button type="button" className="btn btn-primary" onClick={(e) => this.addOne(i, e)}><i className="fa fa-plus"> </i>
                    </button></td>
                <td><button type="button" className="btn btn-primary" onClick={(e) => this.subtractOne(i, e)}><i className="fa fa-minus"> </i></button></td>
            </tr>
        );

        let caffeineAccmulator = this.state.allBeverages.reduce((accumulator, beverage) => {
            return accumulator + beverage.caffeine_mg * beverage.qty;
        } , 0);


        if ( this.state.allOptions != null && this.state.allOptions.length > 0 ) {
            var options = this.state.allOptions.map((combination, i) => {
                var column = Object.keys(combination).map((beverage_id, j) => {
                    return (
                        <p key={j}> {combination[beverage_id]} </p>
                    );
                });
                return (
                    <div key={i} className="col-sm-2 options">
                        <p>Option {i}</p>
                        {column}
                    </div>
                );
            });
        }

        return (
            <div className="container">

                <div className="page-header">
                    <h1>Caffeine Monitor</h1><div className="subTitle">Because you can't keep count</div>
                </div>

                <div className="row">

                    <table className="table">
                        <thead className="thead-dark">
                        <tr>
                            <th>Fave</th>
                            <th>Damage</th>
                            <th>Qty</th>
                            <th></th>
                            <th></th>
                        </tr>
                        </thead>

                        <tbody>
                        {rows}
                        <tr>
                            <td>Total</td>
                            <td>{caffeineAccmulator}mg</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        </tbody>

                    </table>

                </div>

                <div className="row">
                        <h2>Your options
                            {this.state.allOptions != null && this.state.allOptions.length === 0 &&
                            <small>
                                &nbsp;&nbsp;You're done for the day.
                            </small>
                            }
                        </h2>

                </div>


                {this.state.allOptions != null && this.state.allOptions.length > 0 &&
                <div className="row">

                    <div className="col-sm-4">
                        <p>&nbsp;</p>
                        {Object.keys(this.state.allOptions[0]).map((id,i) =>

                            <p key={id}>{this.state.namesLookup[id]}</p>
                        )}
                    </div>

                    {options}
                </div>
                }

            </div>
        );
    }
}



// ========================================

ReactDOM.render(
    <Beverages />,
    document.getElementById('root')
);
