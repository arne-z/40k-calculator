import React from 'react';
import './CalcForm.scss';
import { Form, Text, Select, Option } from 'informed';

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


  return `Average Damge Caused to ${name}: ${woundsLost.toFixed(2)} wounds caused which kills ${modelsLost.toFixed(2)} models.`
}

function getResults(attackConfig) {
  if (isNaN(attackConfig.attacks)
    || isNaN(attackConfig.damage)
    || isNaN(attackConfig.ap)
    || isNaN(attackConfig.strength)
    || isNaN(attackConfig.tohit)
    || !attackConfig.enemies) {
    return `Please enter all fields above to see results.`
  }
  return <ul>{attackConfig.enemies.map(enemy => <li>{getAverageDamage(attackConfig, targets.find(target => target.name === enemy))}</li>)}</ul>
}

function CalcForm() {
  return (
    <Form>
      {({ formState }) => (
        <div class="form-group CalcForm">
          <div>
            <label>Attacks/Shots:</label><Text class="form-control" field="attacks" tabIndex="1" placeholder="Number of Attacks/Shots" />
          </div>
          <div>
            <label>To-Hit:</label><Text class="form-control" field="tohit" type="number" tabIndex="2" placeholder="Roll Required to Hit" />
            <div>
              <Select class="form-control" field="rerollHit">
                <Option value="none" >Don't reroll hit rolls</Option>
                <Option value="ones">Re-roll ones only</Option>
                <Option value="all">Re-roll all failed</Option>
              </Select>
            </div>
          </div>
          <div>
            <label>Strength:</label><Text class="form-control" field="strength" type="number" tabIndex="3" placeholder="Strength of the Weapon" />
            <div>
              <Select class="form-control" field="rerollWound">
                <Option value="none" >Don't re-roll wound rolls</Option>
                <Option value="ones">Re-roll ones only</Option>
                <Option value="all">Re-roll all failed</Option>
              </Select>
            </div>
          </div>
          <div>
            <label>AP:</label><Text class="form-control" field="ap" type="number" tabIndex="4" placeholder="Armor Piercing value of the Weapon" />
          </div>
          <div>
            <label>Damage:</label><Text class="form-control" field="damage" tabIndex="5" placeholder="Damage of the Weapon" />
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
            <p className='CalcForm__results'>{getResults(formState.values)}</p>
          </div>

        </div>
      )}
    </Form>
  );
}

export default CalcForm;
