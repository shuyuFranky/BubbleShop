/** @jsx React.DOM */

var ProductsList = React.createClass({
    render: function() {
        //var goods = this.props.data;
        var products = this.props.data.map(function(product) {
            return (
              <li key={product.id}>
                <Product data={product} />
              </li>
            )
        });

        return (
          <ul className="clearfix">
            {products}
          </ul>
        );
    }
});
