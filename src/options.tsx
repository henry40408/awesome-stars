import React from 'react'
import { render } from 'react-dom'

import 'bootstrap/dist/css/bootstrap.min.css'

const Options = () => (
  <div className="container my-3">
    <h1>Awesome Stars</h1>
    <form>
      <div className="input-group mt-4">
        <input type="text" className="form-control" placeholder="GitHub token" />
        <input type="submit" value="Update" className="btn btn-primary" />
      </div>
    </form>
  </div>
)

render(<Options />, document.getElementById('app'))
