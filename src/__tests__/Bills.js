/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const windowIcon = screen.getByTestId('icon-window') 
      // grace a l'inspecteur ou vois que l'icon necessite la class "active-icon" pour etre surligner https://github.com/testing-library/jest-dom#tohaveclass
      // cela ne fonctionne pas je me retrouve avec "TypeError: expect(...).toHaveClass is not a function"
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  // ajout des autres tests pour avoir au minimum 80% de couverture
  // faire des test des différentes fonctionnalités et messages d'erreur, également les appelle api
  // test pour le bouton qui affiche le justificatif
  describe("When I click on the actions icon", () => {
    test("Then a modal should open", () => {
      // il faut simuler l'intégration, ajouter les event listener, cliquer dessus, puis tester
      // constuire le dom
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname})
      }

      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const bills = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: bills })

      // récupération des éléments du dom
      const actionIcons = document.querySelectorAll(`div[data-testid="icon-eye"]`)
      const modal = document.getElementById('modaleFile')

      // création de l'event listener
      actionIcons.forEach(actionIcon => {
        const handleClickOnActionIcon = jest.fn(bills.handleClickIconEye(actionIcon))
        actionIcon.addEventListener('click', handleClickOnActionIcon)
        userEvent.click(actionIcon)

        expect(bills.handleClickIconEye).toHaveBeenCalled()
        expect(modal.classList.contains('show')).toBe(true)
      });
    })
  })
  
  // tester la navigation pour la route new bill
  describe("When i click on the new bill button", () => {
    test("Then it should navigate to NewBill", () => {

      // constuire le dom
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname})
      }

      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const bills = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: bills })

      // récupération des éléments du dom
      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)

      // création de l'event listner
      const handleNavigateToNewBill = jest.fn(bills.handleClickNewBill)
      buttonNewBill.addEventListener('click', handleNavigateToNewBill)
      userEvent.click(buttonNewBill)

      expect(handleNavigateToNewBill).toHaveBeenCalled()
    })
  })

  describe("When i am on the bills page and it's loading", () => {
    test("Then the loading page should be rendered", async () => {
      
      // création du dom durant le loading
      document.body.innerHTML = BillsUI({loading: true})

      expect(document.getElementById('loading')).toBeDefined()
      expect(document.getElementById('loading').innerHTML).toMatch('Loading...')
    })
  })

  describe("When i am on the bills page but there is an error", () => {
    test("Then the error page should be rendered", async () => {
      
      // création du dom durant le loading
      document.body.innerHTML = BillsUI({error: "erreur"})

      const errorNode = document.querySelector(`div[data-testid="error-message"]`)

      expect(errorNode).toBeDefined()
      expect(errorNode.innerHTML).toMatch('erreur')

      document.body.innerHTML = ""
    })
  })

  // test l'api
  describe("When i am on the bills page", () => {
    describe("the api is fetched", () => {

      // beforeEach(() => {
      //   Object.defineProperty(
      //       window,
      //       'localStorage',
      //       { value: localStorageMock }
      //   )
      //   window.localStorage.setItem('user', JSON.stringify({
      //     type: 'Employee',
      //     email: "a@a"
      //   }))
      //   const root = document.createElement("div")
      //   root.setAttribute("id", "root")
      //   document.body.appendChild(root)
      //   router()
      //   window.onNavigate(ROUTES_PATH.Bills)
      // })

      // ajout test si tout se passe bien
      // test("fetches bills from mock API GET", async () => {
      //   localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }));
      //   const root = document.createElement("div")
      //   root.setAttribute("id", "root")
      //   document.body.append(root)
      //   router()
      //   window.onNavigate(ROUTES_PATH.Bills)

      //   await waitFor(() => screen.getByText("Mes notes de frais"))
      //   const newBillBtn = await screen.findByRole("button", {
      //     name: /nouvelle note de frais/,
      //   })
        
      //   const billsTableRows = screen.getByTestId("tbody")

      //   expect(newBillBtn).toBeTruthy()
      //   expect(billsTableRows).toBeTruthy()
      //   expect(within(billsTableRows).getAllByRole("row")).toHaveLength(4)
      // })

      describe("the api return a error message", () => {

        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(
              window,
              'localStorage',
              { value: localStorageMock }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: "a@a"
          }))
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()
        })

        test("the error message is a 404", async () => {
          mockStore.bills(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 404"))
              }
            }
          })
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick)
          const message = await screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })

        // ajout erreur 500
      })
    })
  })
})



