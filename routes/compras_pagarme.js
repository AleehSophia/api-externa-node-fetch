var express = require('express');
var router = express.Router();
var pagarme = require('../lib/pagarme');

/* POST criacao compras. */
router.post('/', function(req, res, next) {
  pagarme.compra(req.body).then((result) => {
    const paymentId = result.Payment.PaymentId;
    pagarme.captura(paymentId)
    .then((result) => {
      if(result.Status == 2){
        res.status(201).send({
          "Status": "Success",
          "Message": "Compra realizada com sucesso.",
          "CompraId": paymentId
        });
      }
      else {
        res.status(402).send({
          "Status": "Failed",
          "Message": "Compra não realizada."
        });
      }
    })
    .catch((err) => {
      console.error(err);
    })
  });
});

/* GET status de compras. */
router.get('/:compra_id/status', function(req, res, next) {
  pagarme.consulta(req.params.compra_id)
  .then((result) => {

    let message = {};
    switch(result.Payment.Status) {
      case 1:
        message = {
          'Staus': 'Pagamento autorizado.'
        }
        break;
      case 2:
        message = {
          'Status': 'Pagamento realizado.'
        }
        break;
      case 12:
        message = {
          'Status': 'Pagamento pendente.'
        }
        break;
      default:
        message = {
          'Status': 'Pagamento falhou.'
        };
    }

    res.send(message);
  });
});

module.exports = router;
