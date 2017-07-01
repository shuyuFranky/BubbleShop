/** @jsx React.DOM */

var Product = React.createClass({
    getInitialState: function() {
      return {
        added: false
      };
    },

    addToCart: function(e) {
      if(!this.state.added) {
        // add
        $.publish('cart.added', this.props.data);
      }
      else {
        // remove
        $.publish('cart.removed', this.props.data["id"]);
      }

      this.setState({
        added: !this.state.added
      });
    },

    render: function() {
        // assign to props
        var data = this.props.data;
        var img_path = "images/goods/" + data.img;

        return (
          <div className="thumbnail">
            <img src={img_path} alt="product image" />
            <div className="caption clearfix">
              <h3><a href={data["kinds"]}>{data["name"]}</a></h3>
              <div className="product__price">{data["kinds"]}</div>
              <br/>
              <div className="product__price">{data["marketprice"]}</div>
              <div className="product__button-wrap">
                <button className={this.state.added ? 'btn btn-danger' : 'btn btn-primary'} onClick={this.addToCart}>
                  {this.state.added ? '从购物车移除' : '加入购物车'}
                </button>
              </div>
            </div>
          </div>
        );
    }
});
