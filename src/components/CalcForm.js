import React from 'react';
import './CalcForm.scss';
import { Form, Text, Select, Option } from 'informed';
import Alert from './Alert';

const targets = [
  { name: 'MEQ', toughness: 4, armor: 3, invul: 7, hp: 1 },
  { name: 'TEQ', toughness: 4, armor: 2, invul: 5, hp: 2 },
  { name: 'GEQ', toughness: 3, armor: 5, invul: 7, hp: 1 },
  { name: 'Ork', toughness: 4, armor: 6, invul: 7, hp: 1 },
  { name: 'Tank', toughness: 8, armor: 3, invul: 7, hp: 12 },
  { name: 'Knight', toughness: 8, armor: 3, invul: 5, hp: 28 }
]

function calcRerollDice(requiredRoll, numRolled, reroll) {
  let chanceToFail = null
  if (reroll === 'ones') {
    let firstRollMiss = pDiceLessThan(requiredRoll)
    let missWasOne = firstRollMiss / (requiredRoll - 1)
    let secondRollHit = missWasOne * pDiceGreaterEqual(requiredRoll)
    chanceToFail = firstRollMiss - secondRollHit
  } else if (reroll === 'all') {
    chanceToFail = Math.pow(pDiceGreaterEqual(requiredRoll), 2)
  }
  else {
    chanceToFail = pDiceLessThan(requiredRoll)
  }
  return numRolled - numRolled * chanceToFail
}

function pDiceGreaterEqual(number) { return (7 - number) / 6 }
function pDiceLessThan(number) { return (number - 1) / 6 }

const diceNumberError = number => {
  return (isNaN(number) || number < 1 || 6 < number || !Number.isInteger(number)) ? 'Needs to be a number between 1 and 6.' : false;
}
const positiveNumberError = number => {
  return (isNaN(number) || number < 0) ? 'Needs to be a positive number.' : false;
}
const naturalNumberError = number => {
  return (isNaN(number) || number < 0 || !Number.isInteger(number)) ? 'Needs to be a whole number.' : false;
}
const naturalNumberNotZeroError = number => {
  return (isNaN(number) || number < 1 || !Number.isInteger(number)) ? 'Needs to be a whole number greater than zero.' : false;
}

function checkFieldErrors(form) {
  const { attacks, damage, ap, strength, tohit } = form;
  const errors = {
    "Attacks/Shots": positiveNumberError(attacks),
    "Damage": positiveNumberError(damage),
    "AP": naturalNumberError(ap),
    "Strength": naturalNumberNotZeroError(strength),
    "To-Hit": diceNumberError(tohit)
  };
  for (var key in errors) {
    if (errors[key]) return "Error in field " + key + ": " + errors[key]
  }
  return false;
}

function calcSavingThrows(wounds, bestSave) {
  return wounds - wounds * pDiceGreaterEqual(bestSave);
}


function calcToWound(strength, toughness) {
  if (strength / toughness >= 2) return 2
  else if (strength / toughness > 1) return 3
  else if (strength / toughness === 1) return 4
  else if (strength / toughness > 0.5) return 5
  else return 6
}


function getAverageDamage(attackConfig, targetConfig) {
  const { attacks, damage, ap, strength, tohit, rerollHit, rerollWound } = attackConfig
  const { toughness, armor, invul, hp, name } = targetConfig
  const hits = calcRerollDice(tohit, attacks, rerollHit)
  const wounds = calcRerollDice((calcToWound(strength, toughness)), hits, rerollWound)
  const bestSave = Math.min(armor + ap, invul)
  const unsaved = calcSavingThrows(wounds, bestSave)
  const woundsLost = unsaved * Math.min(damage, hp)
  const modelsLost = woundsLost / hp
  return { name: name, wounds: woundsLost.toFixed(2), models: modelsLost.toFixed(2) };
  // return `Average damage caused to ${name}: ${woundsLost.toFixed(2)} wounds caused which kills ${modelsLost.toFixed(2)} models.`
}

function getResults(formState) {
  const attackConfig = formState.values
  const error = checkFieldErrors(attackConfig);
  if (attackConfig.attacks === undefined
    || attackConfig.damage === undefined
    || attackConfig.ap === undefined
    || attackConfig.strength === undefined
    || attackConfig.tohit === undefined
    || attackConfig.enemies === undefined) {
    return <Alert message="Please enter all fields above and select at least one target to see the results." />;
  }
  else if (error) {
    return <Alert message={error} />;
  }
  return (
    <table className="CalcForm__response">
      <tr>
        <th>Target</th>
        <th>Wounds Caused</th>
        <th>Models Lost</th>
      </tr>
      {attackConfig.enemies.map((enemy) => {
        const response = getAverageDamage(attackConfig, targets.find(target => target.name === enemy))
        return (
          <tr>
            <td>{enemy}</td>
            <td>{response.wounds}</td>
            <td>{response.models}</td>
          </tr>
        )
      }
      )}
    </table>
  );
}

function CalcForm() {
  return (
    <Form>
      {({ formState }) => (
        <div className="form-group CalcForm">
          <div>
            <label>Attacks/Shots:</label><Text className="form-control" type="number" field="attacks" tabIndex="1" placeholder="Number of Attacks/Shots" />
          </div>
          <div>
            <label>To-Hit:</label><Text className="form-control" field="tohit" type="number" tabIndex="2" placeholder="Roll Required to Hit" />
            <div>
              <Select className="form-control" field="rerollHit">
                <Option value="none" >Don't reroll hit rolls</Option>
                <Option value="ones">Re-roll ones only</Option>
                <Option value="all">Re-roll all failed</Option>
              </Select>
            </div>
          </div>
          <div>
            <label>Strength:</label><Text className="form-control" field="strength" type="number" tabIndex="3" placeholder="Strength of the Weapon" />
            <div>
              <Select className="form-control" field="rerollWound">
                <Option value="none" >Don't re-roll wound rolls</Option>
                <Option value="ones">Re-roll ones only</Option>
                <Option value="all">Re-roll all failed</Option>
              </Select>
            </div>
          </div>
          <div>
            <label>AP:</label><Text className="form-control" field="ap" type="number" tabIndex="4" placeholder="Armor Piercing value of the Weapon" />
          </div>
          <div>
            <label>Damage:</label><Text className="form-control" field="damage" type="number" tabIndex="5" placeholder="Damage of the Weapon" />
          </div>
          <div>
            <label>Target:</label><p />
            <Select
              className="form-control"
              field="enemies"
              id="select-enemies"
              multiple>
              <Option value="GEQ">GEQ - Guardsmen Equivalent</Option>
              <Option value="MEQ">MEQ - Space Marine Equivalent</Option>
              <Option value="TEQ">TEQ - Terminator Equivalent</Option>
              <Option value="Ork">Ork - Ork Boyz</Option>
              <Option value="Tank">Tank - Leman Russ Equivalent</Option>
              <Option value="Knight">Knight - Imperial Knight Questoris</Option>
            </Select>
          </div>
          <div>
            {getResults(formState)}
          </div>

        </div>
      )}
    </Form>
  );
}

export default CalcForm;
